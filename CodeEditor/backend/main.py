# Apply compatibility patches (MUST be before any langchain imports)
import pydantic_v1_patch
import groq_client_patch

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import json
import uuid
from typing import Dict
from config import settings
from models.schemas import (
    ProjectRequest, ProjectResponse, ProjectStatus, 
    StageType, WebSocketMessage
)

app = FastAPI(title="AI Code Editor API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for project states
projects: Dict[str, ProjectStatus] = {}


@app.get("/")
async def root():
    return {"message": "AI Code Editor API", "status": "running"}


@app.post("/api/projects", response_model=ProjectResponse)
async def create_project(request: ProjectRequest):
    """Create a new project generation request"""
    project_id = str(uuid.uuid4())
    
    projects[project_id] = ProjectStatus(
        project_id=project_id,
        stage=StageType.IDEA,
        files=[]
    )
    
    return ProjectResponse(
        project_id=project_id,
        status="created",
        stage=StageType.IDEA
    )


@app.get("/api/projects/{project_id}", response_model=ProjectStatus)
async def get_project(project_id: str):
    """Get project status and details"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return projects[project_id]


@app.get("/api/projects/{project_id}/files")
async def get_project_files(project_id: str):
    """Get all generated files for a project"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"files": projects[project_id].files}


@app.get("/api/projects/{project_id}/preview")
async def get_project_preview(project_id: str):
    """Get preview URL for a project"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects[project_id]
    if not project.preview_url:
        raise HTTPException(status_code=404, detail="Preview not available yet")
    
    return {"preview_url": project.preview_url}


@app.post("/api/projects/{project_id}/regenerate")
async def regenerate_project(project_id: str, request: ProjectRequest):
    """Regenerate a project with a new prompt"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Reset project state
    projects[project_id] = ProjectStatus(
        project_id=project_id,
        stage=StageType.IDEA,
        files=[]
    )
    
    return {"status": "regenerating", "project_id": project_id}


@app.websocket("/ws/generate/{project_id}")
async def websocket_generate(websocket: WebSocket, project_id: str):
    """WebSocket endpoint for real-time project generation"""
    await websocket.accept()
    
    try:
        # Receive the initial prompt
        data = await websocket.receive_text()
        prompt_data = json.loads(data)
        user_prompt = prompt_data.get("prompt", "")
        
        if not user_prompt:
            await websocket.send_json({
                "stage": "error",
                "content": "No prompt provided",
                "data": None
            })
            await websocket.close()
            return
        
        # Validate prompt
        from utils.error_handler import validate_prompt
        is_valid, error_msg = validate_prompt(user_prompt)
        if not is_valid:
            await websocket.send_json({
                "stage": "error",
                "content": error_msg,
                "data": None
            })
            await websocket.close()
            return
        
        # Import agents here to avoid circular imports
        from agents.idea_agent import IdeaAgent
        from agents.planning_agent import PlanningAgent
        from agents.code_agent import CodeAgent
        from agents.build_agent import BuildAgent
        from services.file_manager import FileManager
        
        # Initialize agents
        idea_agent = IdeaAgent()
        planning_agent = PlanningAgent()
        code_agent = CodeAgent()
        build_agent = BuildAgent()
        file_manager = FileManager()
        
        # Stage 1: Idea Generation
        await websocket.send_json({
            "stage": "idea",
            "content": "Analyzing your request and generating project specification...",
            "data": None
        })
        
        spec = await idea_agent.generate_spec(user_prompt)
        projects[project_id].spec = spec
        projects[project_id].stage = StageType.IDEA
        
        await websocket.send_json({
            "stage": "idea",
            "content": f"Project Spec: {spec.description}\nTech Stack: {spec.tech_stack.value}",
            "data": spec.dict()
        })
        
        # Stage 2: Planning
        await websocket.send_json({
            "stage": "planning",
            "content": "Creating implementation plan and file structure...",
            "data": None
        })
        
        plan = await planning_agent.create_plan(spec)
        projects[project_id].plan = plan
        projects[project_id].stage = StageType.PLANNING
        
        await websocket.send_json({
            "stage": "planning",
            "content": f"Plan created with {len(plan.file_structure)} files",
            "data": {
                "file_structure": [f.dict() for f in plan.file_structure],
                "todos": plan.todos,
                "dependencies": plan.dependencies
            }
        })
        
        # Stage 3: Code Generation
        await websocket.send_json({
            "stage": "coding",
            "content": "Generating code files...",
            "data": None
        })
        
        # Create project directory
        project_path = file_manager.create_project_directory(project_id)
        
        # Generate files one by one
        all_files = file_manager.flatten_file_structure(plan.file_structure)
        generated_files = []
        
        for idx, file_node in enumerate(all_files):
            if file_node.type == "file":
                await websocket.send_json({
                    "stage": "coding",
                    "content": f"Generating {file_node.path} ({idx + 1}/{len(all_files)})...",
                    "data": {"current_file": file_node.path}
                })
                
                generated_file = await code_agent.generate_file(
                    file_node.path, 
                    spec, 
                    plan,
                    generated_files  # Pass previously generated files as context
                )
                
                # Write file to disk
                file_manager.write_file(project_id, generated_file.path, generated_file.content)
                generated_files.append(generated_file)
                projects[project_id].files.append(generated_file)
                
                # Send file content to frontend
                await websocket.send_json({
                    "stage": "coding",
                    "content": f"Generated {file_node.path}",
                    "data": {
                        "file": generated_file.dict()
                    }
                })
        
        projects[project_id].stage = StageType.CODING
        
        # Stage 4: Building
        await websocket.send_json({
            "stage": "building",
            "content": "Installing dependencies and building project...",
            "data": None
        })
        
        build_result = await build_agent.build_and_serve(project_id, plan.project_type, project_path)
        
        if build_result.success:
            projects[project_id].preview_url = build_result.preview_url
            projects[project_id].stage = StageType.COMPLETE
            
            await websocket.send_json({
                "stage": "complete",
                "content": "Project built successfully!",
                "data": {
                    "preview_url": build_result.preview_url,
                    "logs": build_result.logs
                }
            })
        else:
            projects[project_id].error = build_result.error
            projects[project_id].stage = StageType.ERROR
            
            await websocket.send_json({
                "stage": "error",
                "content": f"Build failed: {build_result.error}",
                "data": {
                    "error": build_result.error,
                    "logs": build_result.logs
                }
            })
        
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for project {project_id}")
    except json.JSONDecodeError as e:
        print(f"Invalid JSON in websocket message: {str(e)}")
        try:
            await websocket.send_json({
                "stage": "error",
                "content": "Invalid message format",
                "data": {"error": "Failed to parse JSON message"}
            })
        except:
            pass
    except Exception as e:
        print(f"Error in websocket: {str(e)}")
        import traceback
        traceback.print_exc()
        
        from utils.error_handler import handle_generation_error
        error_data = handle_generation_error(e)
        
        try:
            await websocket.send_json({
                "stage": "error",
                "content": f"An error occurred: {error_data['message']}",
                "data": error_data
            })
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)

