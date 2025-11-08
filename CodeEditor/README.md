# AI Code Editor

An AI-powered code editor that generates complete web applications using LangChain and Groq. Similar to Lovable, v0.dev, and bolt.new.

## Features

- 🤖 **Multi-Agent System**: Idea Generation → Planning → Code Generation → Building
- ⚡ **Real-time Updates**: WebSocket-based live progress tracking
- 🎨 **Modern UI**: Dark mode interface with syntax highlighting
- 🔨 **Live Preview**: Sandboxed build and preview environment
- 📁 **Multiple Project Types**: React/Vite, Next.js, and HTML/CSS
- 🚀 **Token Optimized**: Smart context management and file templates

## Architecture

### Backend (Python)
- FastAPI with WebSocket support
- LangChain + Groq (llama-3.1-70b-versatile)
- Multi-agent workflow system
- Sandboxed build environment

### Frontend (React)
- React 18 + Vite + TypeScript
- TailwindCSS for styling
- Real-time WebSocket communication
- Syntax-highlighted code viewer
- Live iframe preview

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn
- Groq API key (get one at [console.groq.com](https://console.groq.com))

## Installation

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# or
cp .env.example .env    # macOS/Linux

# Edit .env and add your Groq API key
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## Configuration

Edit `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
GENERATED_PROJECTS_PATH=./generated_projects
MAX_BUILD_TIMEOUT=300
PREVIEW_PORT_RANGE_START=8000
PREVIEW_PORT_RANGE_END=9000
FRONTEND_URL=http://localhost:5173
```

## Running the Application

### Start Backend

```bash
cd backend
python main.py
```

The backend will start on `http://localhost:8000`

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. Open `http://localhost:5173` in your browser
2. Describe your project in the chat interface (e.g., "Create a todo app with dark mode")
3. Watch as the AI:
   - Generates a detailed project specification
   - Creates an implementation plan
   - Generates all code files
   - Builds and previews your application
4. View generated files in the file tree
5. Click on files to see syntax-highlighted code
6. See your application running in the live preview pane

## Project Types

### React + Vite
Best for single-page applications and modern web apps
- Fast development with hot module replacement
- Modern React with hooks
- Optimized production builds

### Next.js
Best for SEO-important sites and full-stack applications
- Server-side rendering
- Static site generation
- API routes

### HTML/CSS
Best for simple static sites and landing pages
- No build step required
- Instant preview
- Lightweight

## Multi-Agent Workflow

1. **Idea Agent**: Expands user prompt into detailed requirements
2. **Planning Agent**: Creates file structure and implementation plan
3. **Code Agent**: Generates code files incrementally
4. **Build Agent**: Builds project and serves live preview

## Token Optimization

- Structured prompts for clear communication
- Incremental file generation (one file at a time)
- Context limiting (only relevant files passed)
- File templates for common files (package.json, configs)
- Summarization between stages

## Error Handling

- Generation failures: Automatic retry with improved prompts
- Build errors: Parsed and displayed to user
- Timeouts: 5-minute limit on builds
- Rate limits: Queued requests
- Invalid code: Self-correction capability

## API Endpoints

### REST API

- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project status
- `GET /api/projects/{id}/files` - Get project files
- `GET /api/projects/{id}/preview` - Get preview URL
- `POST /api/projects/{id}/regenerate` - Regenerate project

### WebSocket

- `WS /ws/generate/{project_id}` - Real-time generation updates

## Development

### Backend Structure

```
backend/
├── main.py                 # FastAPI entry point
├── config.py              # Configuration
├── agents/                # AI agents
│   ├── idea_agent.py
│   ├── planning_agent.py
│   ├── code_agent.py
│   └── build_agent.py
├── services/              # Core services
│   ├── groq_service.py
│   ├── file_manager.py
│   └── builder.py
├── models/                # Data models
│   └── schemas.py
└── utils/                 # Utilities
    └── error_handler.py
```

### Frontend Structure

```
frontend/
├── src/
│   ├── App.tsx           # Main app component
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   └── types/            # TypeScript types
└── package.json
```

## Troubleshooting

### Backend won't start
- Check Python version (3.11+)
- Verify Groq API key in .env
- Ensure all dependencies are installed

### Frontend won't start
- Check Node.js version (18+)
- Delete node_modules and reinstall
- Check for port conflicts (5173)

### Build failures
- Ensure Node.js and npm are in PATH
- Check generated_projects directory permissions
- Verify port range availability (8000-9000)

### WebSocket connection issues
- Check firewall settings
- Verify CORS configuration
- Ensure backend is running

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Acknowledgments

- Built with LangChain and Groq
- Inspired by Lovable, v0.dev, and bolt.new
- UI components styled with TailwindCSS

