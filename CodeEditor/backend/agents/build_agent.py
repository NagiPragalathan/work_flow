from services.builder import BuildService
from models.schemas import BuildResult, ProjectType
from pathlib import Path


class BuildAgent:
    """
    Agent responsible for building and serving projects
    """
    
    def __init__(self):
        self.builder = BuildService()
    
    async def build_and_serve(
        self, 
        project_id: str,
        project_type: ProjectType, 
        project_path: Path
    ) -> BuildResult:
        """
        Build and serve a project based on its type
        
        Args:
            project_id: Project identifier
            project_type: Type of project (react-vite, nextjs, html-css)
            project_path: Path to project directory
            
        Returns:
            BuildResult: Result of build operation with preview URL
        """
        if project_type == ProjectType.REACT_VITE:
            return await self.builder.build_react_vite(project_path)
        elif project_type == ProjectType.NEXTJS:
            return await self.builder.build_nextjs(project_path)
        elif project_type == ProjectType.HTML_CSS:
            return await self.builder.build_html_css(project_path)
        else:
            return BuildResult(
                success=False,
                error=f"Unknown project type: {project_type}"
            )

