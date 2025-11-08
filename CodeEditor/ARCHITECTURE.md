# AI Code Editor - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User Browser                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         React Frontend (Port 5173)               │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │  │
│  │  │ Chat   │ │ File   │ │ Code   │ │ Preview  │ │  │
│  │  │        │ │ Tree   │ │ Viewer │ │ Pane     │ │  │
│  │  └────────┘ └────────┘ └────────┘ └──────────┘ │  │
│  │                     │                            │  │
│  │              WebSocket Hook                      │  │
│  └──────────────────┬───────────────────────────────┘  │
└─────────────────────┼────────────────────────────────┘
                      │
                 WebSocket                                
                      │                                  
┌─────────────────────┼────────────────────────────────┐
│                     │    FastAPI Backend             │
│  ┌──────────────────┴─────────────────────────────┐ │
│  │          WebSocket Endpoint                    │ │
│  │     /ws/generate/{project_id}                  │ │
│  └──────────────────┬─────────────────────────────┘ │
│                     │                                │
│  ┌──────────────────┴─────────────────────────────┐ │
│  │         Multi-Agent Workflow                   │ │
│  │                                                 │ │
│  │  ┌──────────┐    ┌──────────┐                 │ │
│  │  │  Idea    │───▶│ Planning │                 │ │
│  │  │  Agent   │    │  Agent   │                 │ │
│  │  └──────────┘    └─────┬────┘                 │ │
│  │                        │                       │ │
│  │                        ▼                       │ │
│  │                  ┌──────────┐                 │ │
│  │                  │   Code   │                 │ │
│  │                  │   Agent  │                 │ │
│  │                  └─────┬────┘                 │ │
│  │                        │                       │ │
│  │                        ▼                       │ │
│  │                  ┌──────────┐                 │ │
│  │                  │  Build   │                 │ │
│  │                  │  Agent   │                 │ │
│  │                  └─────┬────┘                 │ │
│  └────────────────────────┼────────────────────┘  │
│                           │                        │
│  ┌────────────────────────┴─────────────────────┐ │
│  │          Groq LLM Service                    │ │
│  │      (llama-3.1-70b-versatile)              │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │          File Manager                        │ │
│  │   (generated_projects/{project_id}/)        │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │          Builder Service                     │ │
│  │   (npm install, build, serve preview)       │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│           Generated Project Preview                 │
│              (Port 8000-9000)                       │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Submits Prompt

```
User Input → ChatInterface → App.tsx → API Service → POST /api/projects
```

### 2. WebSocket Connection Established

```
App.tsx → useWebSocket → WS /ws/generate/{project_id} → Backend
```

### 3. Multi-Agent Processing

```
Backend receives prompt via WebSocket
    ↓
Idea Agent: Analyzes prompt
    ↓ (streams status to frontend)
Planning Agent: Creates file structure
    ↓ (streams status to frontend)
Code Agent: Generates files one-by-one
    ↓ (streams each file to frontend)
Build Agent: Builds project
    ↓ (streams build status)
Complete: Returns preview URL
```

### 4. Frontend Updates

```
WebSocket Message → handleWebSocketMessage → State Updates
    ↓
ProgressIndicator updates stage
    ↓
ChatInterface shows AI messages
    ↓
FileTree displays generated files
    ↓
CodeViewer shows selected file
    ↓
PreviewPane loads iframe with preview URL
```

## Agent Details

### Idea Agent

**Purpose**: Convert user prompt into structured specification

**Input**:
```typescript
{
  prompt: "Create a todo app..."
}
```

**Output**:
```typescript
{
  tech_stack: "react-vite" | "nextjs" | "html-css",
  features: ["feature 1", "feature 2"],
  ui_requirements: "dark mode, modern design...",
  data_flow: "state management approach...",
  description: "project summary"
}
```

**Optimization**:
- Single LLM call
- JSON-structured output
- Retry logic for malformed responses

### Planning Agent

**Purpose**: Create implementation plan and file structure

**Input**: Project specification from Idea Agent

**Output**:
```typescript
{
  file_structure: [
    {
      name: "src",
      type: "directory",
      path: "src",
      children: [...]
    }
  ],
  todos: ["step 1", "step 2"],
  dependencies: {
    "react": "^18.2.0",
    ...
  }
}
```

**Optimization**:
- Single LLM call
- Hierarchical file structure
- Complete dependency list

### Code Agent

**Purpose**: Generate individual code files

**Input**:
- File path to generate
- Project specification
- Project plan
- Context (previously generated files)

**Output**:
```typescript
{
  path: "src/App.tsx",
  content: "// Generated code...",
  language: "typescript"
}
```

**Optimization**:
- File templates for common files (package.json, configs)
- Context limiting (only relevant files)
- One file at a time (incremental)
- Streaming updates to frontend

### Build Agent

**Purpose**: Build and serve the generated project

**Process**:
1. Detect project type
2. Run `npm install`
3. Run build command (`npm run build` or serve directly)
4. Start static server on available port
5. Return preview URL

**Timeout**: 5 minutes (configurable)

**Ports**: 8000-9000 (configurable)

## Token Optimization Strategies

### 1. File Templates
Common files use predefined templates:
- `package.json` - Base template with merged dependencies
- `vite.config.js` - Static template
- `next.config.js` - Static template

**Savings**: ~500-1000 tokens per project

### 2. Context Limiting
When generating a file, only pass:
- File's own path and requirements
- Package.json (if exists)
- Files from same directory (max 3)
- Each context file truncated to 500 chars

**Savings**: ~2000-5000 tokens per file

### 3. Incremental Generation
Generate files one by one, not all at once.

**Benefits**:
- Lower memory usage
- Better error recovery
- Real-time progress updates

### 4. Structured Prompts
Clear, concise system prompts with explicit JSON schemas.

**Benefits**:
- Fewer tokens in prompt
- More reliable responses
- Less retry attempts

### 5. Summarization
Pass summarized context between agents, not full responses.

**Savings**: ~1000-2000 tokens per stage transition

## Error Handling

### Generation Errors

```python
try:
    spec = await idea_agent.generate_spec(prompt)
except IdeaGenerationError as e:
    send_error_to_frontend(e.message, e.stage)
```

Custom exception types:
- `IdeaGenerationError`
- `PlanningError`
- `CodeGenerationError`
- `BuildError`

### Build Errors

```python
result = await build_agent.build_and_serve(...)
if not result.success:
    # Parse and format error
    formatted_error = format_build_error(result.error)
    # Send to frontend
```

### WebSocket Errors

```python
try:
    # Generation workflow
except WebSocketDisconnect:
    # Clean up and log
except Exception as e:
    # Format error
    error_data = handle_generation_error(e)
    # Send to frontend
finally:
    # Always close connection
```

## Security Considerations

### Current Implementation (Development)

1. **Subprocess Sandboxing**
   - Timeout limits (5 minutes)
   - Isolated project directories
   - Limited to npm commands

2. **Input Validation**
   - Prompt length limits (10-5000 chars)
   - JSON validation
   - Path sanitization

3. **CORS**
   - Configured for localhost
   - Specific origins only

### Production Recommendations

1. **Docker Containers**
   - Each build in ephemeral container
   - Network isolation
   - Resource limits (CPU, memory)
   - Automatic cleanup

2. **Authentication**
   - API key system
   - Rate limiting per user
   - Project ownership

3. **Content Security**
   - CSP headers for preview iframe
   - Sanitize generated code
   - Restrict file system access

4. **Resource Limits**
   - Max projects per user
   - Storage quotas
   - Build queue management

## Performance Characteristics

### Typical Generation Times

1. **Idea Stage**: 10-15 seconds
   - Single LLM call
   - JSON parsing

2. **Planning Stage**: 10-15 seconds
   - Single LLM call
   - File structure creation

3. **Coding Stage**: 30-60 seconds
   - Multiple LLM calls (one per file)
   - Typical project: 5-10 files
   - ~5-10 seconds per file

4. **Building Stage**: 30-90 seconds
   - npm install: 20-40 seconds
   - Build: 10-30 seconds
   - Server start: < 1 second

**Total**: ~2-3 minutes for typical project

### Optimization Opportunities

1. **Parallel File Generation**
   - Generate independent files concurrently
   - Requires careful context management

2. **Dependency Caching**
   - Cache common npm packages
   - Reuse across projects

3. **Template Projects**
   - Pre-built project skeletons
   - Only generate custom code

4. **Incremental Builds**
   - Only rebuild changed files
   - Hot module replacement

## Scaling Considerations

### Horizontal Scaling

1. **Frontend**: Stateless, CDN-friendly
2. **Backend**: Needs session affinity for WebSocket
3. **Build Service**: Can be separate microservice

### Vertical Scaling

- CPU-bound: LLM calls, builds
- Memory: Depends on project size
- Disk: Generated projects (clean up old)
- Network: WebSocket connections

### Database (Future)

Currently in-memory. For production:
- PostgreSQL for projects metadata
- Redis for WebSocket session data
- S3/MinIO for generated files

## Technology Choices

### Why FastAPI?
- Async/await support
- Built-in WebSocket
- Fast performance
- Type hints

### Why LangChain?
- Easy LLM integration
- Retry logic
- Structured output parsing
- Multi-provider support

### Why Groq?
- Fastest inference (llama-3.1-70b)
- Free tier available
- Good code generation
- Reliable API

### Why React + Vite?
- Fast development
- HMR for instant updates
- TypeScript support
- Modern tooling

### Why WebSocket?
- Real-time updates
- Lower latency vs polling
- Bidirectional communication
- Efficient for streaming

## Future Enhancements

1. **User Authentication**
   - Save projects to account
   - Project history
   - Sharing capabilities

2. **Code Editing**
   - Allow manual edits
   - Regenerate specific files
   - Git integration

3. **Deployment**
   - One-click deploy to Vercel/Netlify
   - Custom domain support
   - Environment variables

4. **Collaboration**
   - Multiple users on same project
   - Real-time co-editing
   - Comments and annotations

5. **More Project Types**
   - Vue, Svelte, Angular
   - Python backends (Flask, Django)
   - Mobile apps (React Native)

6. **AI Improvements**
   - Better error recovery
   - Self-healing code
   - Performance optimization suggestions
   - Accessibility improvements

7. **Testing**
   - Generate unit tests
   - Run tests automatically
   - Coverage reports

8. **Documentation**
   - Auto-generate README
   - Code comments
   - API documentation

