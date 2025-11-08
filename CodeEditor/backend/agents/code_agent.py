from services.groq_service import GroqService
from models.schemas import ProjectSpec, ProjectPlan, GeneratedFile
from typing import List, Dict
import json


class CodeAgent:
    """
    Agent responsible for generating code files
    """
    
    def __init__(self):
        self.groq = GroqService()
        # File templates for common files to save tokens
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, str]:
        """Load predefined templates for common files"""
        return {
            "package.json": {
                "react-vite": {
                    "name": "generated-app",
                    "private": True,
                    "version": "0.0.0",
                    "type": "module",
                    "scripts": {
                        "dev": "vite",
                        "build": "vite build",
                        "preview": "vite preview"
                    },
                    "dependencies": {
                        "react": "^18.2.0",
                        "react-dom": "^18.2.0"
                    },
                    "devDependencies": {
                        "@types/react": "^18.2.43",
                        "@types/react-dom": "^18.2.17",
                        "@vitejs/plugin-react": "^4.2.1",
                        "vite": "^5.0.8"
                    }
                },
                "nextjs": {
                    "name": "generated-app",
                    "version": "0.1.0",
                    "private": True,
                    "scripts": {
                        "dev": "next dev",
                        "build": "next build",
                        "start": "next start"
                    },
                    "dependencies": {
                        "next": "14.0.0",
                        "react": "^18.2.0",
                        "react-dom": "^18.2.0"
                    }
                }
            },
            "vite.config.js": """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})""",
            "next.config.js": """/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig"""
        }
    
    async def generate_file(
        self, 
        file_path: str, 
        spec: ProjectSpec, 
        plan: ProjectPlan,
        context_files: List[GeneratedFile] = None
    ) -> GeneratedFile:
        """
        Generate a single file
        
        Args:
            file_path: Path of file to generate
            spec: Project specification
            plan: Project plan
            context_files: Previously generated files for context
            
        Returns:
            GeneratedFile: Generated file with content
        """
        # Check if we have a template for this file
        if file_path == "package.json":
            content = await self._generate_package_json(spec, plan)
            return GeneratedFile(
                path=file_path,
                content=content,
                language="json"
            )
        
        if file_path == "vite.config.js" and spec.tech_stack == ProjectType.REACT_VITE:
            return GeneratedFile(
                path=file_path,
                content=self.templates["vite.config.js"],
                language="javascript"
            )
        
        if file_path == "next.config.js" and spec.tech_stack == ProjectType.NEXTJS:
            return GeneratedFile(
                path=file_path,
                content=self.templates["next.config.js"],
                language="javascript"
            )
        
        # Generate file using LLM
        return await self._generate_file_with_llm(file_path, spec, plan, context_files)
    
    async def _generate_package_json(self, spec: ProjectSpec, plan: ProjectPlan) -> str:
        """Generate package.json with custom dependencies"""
        if spec.tech_stack == ProjectType.REACT_VITE:
            base = self.templates["package.json"]["react-vite"].copy()
        elif spec.tech_stack == ProjectType.NEXTJS:
            base = self.templates["package.json"]["nextjs"].copy()
        else:
            return json.dumps({}, indent=2)
        
        # Merge with plan dependencies
        if "dependencies" not in base:
            base["dependencies"] = {}
        base["dependencies"].update(plan.dependencies)
        
        return json.dumps(base, indent=2)
    
    async def _generate_file_with_llm(
        self,
        file_path: str,
        spec: ProjectSpec,
        plan: ProjectPlan,
        context_files: List[GeneratedFile] = None
    ) -> GeneratedFile:
        """Generate file content using LLM"""
        
        # Determine file language
        language = self._detect_language(file_path)
        
        # Build context from relevant files
        context = self._build_context(file_path, context_files)
        
        system_prompt = f"""You are an expert programmer. Generate production-ready code for the specified file.

Requirements:
1. Write clean, well-structured, modern code
2. Follow best practices for {language}
3. Include necessary imports and dependencies
4. Add helpful comments for complex logic
5. Ensure code is complete and functional

IMPORTANT: Return ONLY the file content, no explanations, no markdown code blocks, just the raw code."""

        user_prompt = f"""Generate code for: {file_path}

Project Details:
- Tech Stack: {spec.tech_stack.value}
- Features: {', '.join(spec.features)}
- UI Requirements: {spec.ui_requirements}

{context}

Generate complete, production-ready code for {file_path}."""

        response = await self.groq.generate_structured_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.7
        )
        
        # Clean up response (remove markdown if present)
        content = self._clean_code_response(response)
        
        return GeneratedFile(
            path=file_path,
            content=content,
            language=language
        )
    
    def _detect_language(self, file_path: str) -> str:
        """Detect programming language from file extension"""
        ext_map = {
            ".js": "javascript",
            ".jsx": "javascript",
            ".ts": "typescript",
            ".tsx": "typescript",
            ".py": "python",
            ".html": "html",
            ".css": "css",
            ".json": "json",
            ".md": "markdown",
        }
        
        for ext, lang in ext_map.items():
            if file_path.endswith(ext):
                return lang
        
        return "text"
    
    def _build_context(self, file_path: str, context_files: List[GeneratedFile] = None) -> str:
        """Build relevant context from previously generated files"""
        if not context_files:
            return ""
        
        # Limit context to avoid token overflow
        # Only include files that are likely relevant
        relevant_files = []
        
        # Always include package.json if available
        for f in context_files or []:
            if f.path == "package.json":
                relevant_files.append(f)
                break
        
        # Include files from same directory
        file_dir = "/".join(file_path.split("/")[:-1])
        for f in context_files or []:
            if f.path.startswith(file_dir) and len(relevant_files) < 3:
                relevant_files.append(f)
        
        if not relevant_files:
            return ""
        
        context = "\nRelevant existing files:\n"
        for f in relevant_files:
            # Truncate long files
            content = f.content[:500] + "..." if len(f.content) > 500 else f.content
            context += f"\n--- {f.path} ---\n{content}\n"
        
        return context
    
    def _clean_code_response(self, response: str) -> str:
        """Remove markdown formatting from code response"""
        response = response.strip()
        
        # Remove markdown code blocks
        if response.startswith("```"):
            lines = response.split("\n")
            # Remove first line (```language)
            lines = lines[1:]
            # Remove last line if it's ```
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            response = "\n".join(lines)
        
        return response.strip()

