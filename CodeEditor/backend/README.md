# Backend - AI Code Editor

Python FastAPI backend with LangChain and Groq integration.

## Structure

```
backend/
├── main.py                 # FastAPI app & WebSocket endpoints
├── config.py              # Configuration management
├── agents/                # AI agents for each stage
│   ├── idea_agent.py      # Converts prompts to specifications
│   ├── planning_agent.py  # Creates implementation plans
│   ├── code_agent.py      # Generates code files
│   └── build_agent.py     # Builds and serves projects
├── services/              # Core services
│   ├── groq_service.py    # Groq LLM integration
│   ├── file_manager.py    # File system operations
│   └── builder.py         # Build & preview service
├── models/                # Pydantic data models
│   └── schemas.py
├── utils/                 # Utility functions
│   └── error_handler.py
└── requirements.txt       # Python dependencies
```

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

4. Test agents:
```bash
python test_agent.py
```

5. Start server:
```bash
python main.py
```

Server runs on `http://localhost:8000`

## API Endpoints

### REST API

- `GET /` - Health check
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project status
- `GET /api/projects/{id}/files` - List project files
- `GET /api/projects/{id}/preview` - Get preview URL
- `POST /api/projects/{id}/regenerate` - Regenerate project

### WebSocket

- `WS /ws/generate/{project_id}` - Real-time generation stream

## Multi-Agent System

### 1. Idea Agent (`idea_agent.py`)
- **Input**: User prompt
- **Output**: Detailed project specification
- **LLM**: Groq llama-3.1-70b-versatile
- **Purpose**: Understand requirements and choose tech stack

### 2. Planning Agent (`planning_agent.py`)
- **Input**: Project specification
- **Output**: File structure and implementation plan
- **Purpose**: Design architecture and dependencies

### 3. Code Agent (`code_agent.py`)
- **Input**: File path, spec, plan, context
- **Output**: Generated code file
- **Purpose**: Generate production-ready code
- **Optimization**: File templates, context limiting

### 4. Build Agent (`build_agent.py`)
- **Input**: Project path and type
- **Output**: Build result and preview URL
- **Purpose**: Build and serve the application

## Configuration

Edit `.env` to configure:

```env
GROQ_API_KEY=your_key_here
GENERATED_PROJECTS_PATH=./generated_projects
MAX_BUILD_TIMEOUT=300
PREVIEW_PORT_RANGE_START=8000
PREVIEW_PORT_RANGE_END=9000
FRONTEND_URL=http://localhost:5173
```

## Token Optimization

1. **File Templates**: Common files (package.json, configs) use templates
2. **Context Limiting**: Only relevant files passed to LLM
3. **Incremental Generation**: Files generated one at a time
4. **Structured Prompts**: Clear, concise system prompts
5. **Summarization**: Context summarized between stages

## Error Handling

- `utils/error_handler.py` provides custom exceptions
- Validation for user prompts
- Automatic retry logic in Groq service
- Build error parsing and formatting
- Comprehensive WebSocket error handling

## Testing

Run agent tests:
```bash
python test_agent.py
```

This will:
1. Test Idea Agent with sample prompt
2. Test Planning Agent with generated spec
3. Test Code Agent with file generation
4. Verify all agents are working

## Extending

### Add New Project Type

1. Add to `ProjectType` enum in `models/schemas.py`
2. Add file template in `code_agent.py`
3. Add build logic in `services/builder.py`

### Customize Prompts

Edit system prompts in agent files:
- `agents/idea_agent.py` - Line ~15
- `agents/planning_agent.py` - Line ~18
- `agents/code_agent.py` - Line ~90

### Add New Agents

1. Create agent file in `agents/`
2. Inherit from base or create new pattern
3. Integrate in `main.py` WebSocket flow

## Troubleshooting

### Import Errors
```bash
pip install --upgrade -r requirements.txt
```

### Groq API Errors
- Verify API key is correct
- Check rate limits (30 req/min free tier)
- Ensure internet connection

### Build Failures
- Verify Node.js and npm in PATH
- Check port availability (8000-9000)
- Review build logs in console

### File Permission Errors
- Ensure write permissions for `generated_projects/`
- Run with appropriate user permissions

