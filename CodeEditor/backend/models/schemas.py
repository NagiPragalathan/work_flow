from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum


class ProjectType(str, Enum):
    REACT_VITE = "react-vite"
    NEXTJS = "nextjs"
    HTML_CSS = "html-css"


class StageType(str, Enum):
    IDEA = "idea"
    PLANNING = "planning"
    CODING = "coding"
    BUILDING = "building"
    COMPLETE = "complete"
    ERROR = "error"


class ProjectSpec(BaseModel):
    tech_stack: ProjectType
    features: List[str]
    ui_requirements: str
    data_flow: str
    description: str


class FileNode(BaseModel):
    name: str
    type: str  # "file" or "directory"
    path: str
    children: Optional[List['FileNode']] = None


class ProjectPlan(BaseModel):
    file_structure: List[FileNode]
    todos: List[str]
    dependencies: Dict[str, str]
    project_type: ProjectType


class GeneratedFile(BaseModel):
    path: str
    content: str
    language: str


class WebSocketMessage(BaseModel):
    stage: StageType
    content: str
    data: Optional[Dict[str, Any]] = None


class ProjectRequest(BaseModel):
    prompt: str


class ProjectResponse(BaseModel):
    project_id: str
    status: str
    stage: StageType


class ProjectStatus(BaseModel):
    project_id: str
    stage: StageType
    spec: Optional[ProjectSpec] = None
    plan: Optional[ProjectPlan] = None
    files: List[GeneratedFile] = []
    preview_url: Optional[str] = None
    error: Optional[str] = None


class BuildResult(BaseModel):
    success: bool
    preview_url: Optional[str] = None
    error: Optional[str] = None
    logs: str = ""

