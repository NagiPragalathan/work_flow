from services.groq_service import GroqService
from models.schemas import ProjectSpec, ProjectType
import json


class IdeaAgent:
    """
    Agent responsible for expanding user prompts into detailed project specifications
    """
    
    def __init__(self):
        self.groq = GroqService()
    
    async def generate_spec(self, user_prompt: str) -> ProjectSpec:
        """
        Generate a detailed project specification from user prompt
        
        Args:
            user_prompt: User's description of desired project
            
        Returns:
            ProjectSpec: Detailed project specification
        """
        system_prompt = """You are an expert software architect. Your task is to analyze user requests and create detailed project specifications.

Given a user's project idea, you must:
1. Determine the most appropriate tech stack (react-vite, nextjs, or html-css)
2. Break down the project into specific features
3. Define UI/UX requirements
4. Outline the data flow and architecture
5. Provide a clear project description

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
    "tech_stack": "react-vite" | "nextjs" | "html-css",
    "features": ["feature 1", "feature 2", ...],
    "ui_requirements": "detailed UI/UX description",
    "data_flow": "description of data flow and state management",
    "description": "clear project summary"
}

Choose tech stack based on:
- react-vite: Single-page apps, interactive UIs, modern web apps
- nextjs: SEO-important sites, full-stack apps, server-side rendering needed
- html-css: Simple static sites, landing pages, portfolios

Return ONLY the JSON, no additional text or markdown formatting."""

        response = await self.groq.generate_with_retry(
            system_prompt=system_prompt,
            user_prompt=f"Project request: {user_prompt}",
            expected_format="json"
        )
        
        # Parse response
        spec_data = self.groq.extract_json_from_response(response)
        
        # Convert to ProjectSpec
        return ProjectSpec(
            tech_stack=ProjectType(spec_data["tech_stack"]),
            features=spec_data["features"],
            ui_requirements=spec_data["ui_requirements"],
            data_flow=spec_data["data_flow"],
            description=spec_data["description"]
        )

