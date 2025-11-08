from services.groq_service import GroqService
from models.schemas import ProjectSpec, ProjectPlan, FileNode, ProjectType
from typing import List, Dict
import json


class PlanningAgent:
    """
    Agent responsible for creating implementation plans and file structures
    """
    
    def __init__(self):
        self.groq = GroqService()
    
    async def create_plan(self, spec: ProjectSpec) -> ProjectPlan:
        """
        Create a detailed implementation plan from project specification
        
        Args:
            spec: Project specification
            
        Returns:
            ProjectPlan: Complete implementation plan with file structure
        """
        system_prompt = """You are an expert software planner. Create a comprehensive implementation plan.

Given a project specification, you must:
1. Design complete file structure with all necessary files
2. List implementation steps as todos
3. Specify all required dependencies

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
    "file_structure": [
        {
            "name": "filename",
            "type": "file" | "directory",
            "path": "relative/path",
            "children": [...]  // only for directories
        }
    ],
    "todos": ["step 1", "step 2", ...],
    "dependencies": {
        "package-name": "version"
    }
}

File structure guidelines:
- For react-vite: Include package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx, components, etc.
- For nextjs: Include package.json, next.config.js, pages/, components/, public/, etc.
- For html-css: Include index.html, styles.css, scripts.js, assets/, etc.

Return ONLY the JSON, no additional text or markdown."""

        user_prompt = f"""Project Specification:
Tech Stack: {spec.tech_stack.value}
Features: {', '.join(spec.features)}
UI Requirements: {spec.ui_requirements}
Data Flow: {spec.data_flow}
Description: {spec.description}

Create a complete file structure and implementation plan."""

        response = await self.groq.generate_with_retry(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            expected_format="json"
        )
        
        # Parse response
        plan_data = self.groq.extract_json_from_response(response)
        
        # Convert file structure to FileNode objects
        def parse_file_nodes(nodes_data: List[Dict]) -> List[FileNode]:
            nodes = []
            for node_data in nodes_data:
                children = None
                if "children" in node_data and node_data["children"]:
                    children = parse_file_nodes(node_data["children"])
                
                node = FileNode(
                    name=node_data["name"],
                    type=node_data["type"],
                    path=node_data["path"],
                    children=children
                )
                nodes.append(node)
            return nodes
        
        file_structure = parse_file_nodes(plan_data["file_structure"])
        
        return ProjectPlan(
            file_structure=file_structure,
            todos=plan_data["todos"],
            dependencies=plan_data["dependencies"],
            project_type=spec.tech_stack
        )

