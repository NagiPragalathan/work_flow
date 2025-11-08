import os
import aiofiles
from pathlib import Path
from typing import List
from config import settings
from models.schemas import FileNode, GeneratedFile
import shutil


class FileManager:
    """Manages file operations for generated projects"""
    
    def __init__(self):
        self.base_path = Path(settings.generated_projects_path)
        self.base_path.mkdir(exist_ok=True)
    
    def create_project_directory(self, project_id: str) -> Path:
        """
        Create a new project directory
        
        Args:
            project_id: Unique project identifier
            
        Returns:
            Path: Path to project directory
        """
        project_path = self.base_path / project_id
        project_path.mkdir(parents=True, exist_ok=True)
        return project_path
    
    async def write_file(self, project_id: str, file_path: str, content: str):
        """
        Write a file to the project directory
        
        Args:
            project_id: Project identifier
            file_path: Relative file path within project
            content: File content
        """
        project_path = self.base_path / project_id
        full_path = project_path / file_path
        
        # Create parent directories if they don't exist
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        async with aiofiles.open(full_path, 'w', encoding='utf-8') as f:
            await f.write(content)
    
    async def read_file(self, project_id: str, file_path: str) -> str:
        """
        Read a file from the project directory
        
        Args:
            project_id: Project identifier
            file_path: Relative file path within project
            
        Returns:
            str: File content
        """
        project_path = self.base_path / project_id
        full_path = project_path / file_path
        
        async with aiofiles.open(full_path, 'r', encoding='utf-8') as f:
            return await f.read()
    
    def get_project_path(self, project_id: str) -> Path:
        """Get the full path to a project directory"""
        return self.base_path / project_id
    
    def delete_project(self, project_id: str):
        """
        Delete a project directory and all its contents
        
        Args:
            project_id: Project identifier
        """
        project_path = self.base_path / project_id
        if project_path.exists():
            shutil.rmtree(project_path)
    
    def list_files(self, project_id: str) -> List[str]:
        """
        List all files in a project
        
        Args:
            project_id: Project identifier
            
        Returns:
            List[str]: List of relative file paths
        """
        project_path = self.base_path / project_id
        files = []
        
        for root, dirs, filenames in os.walk(project_path):
            for filename in filenames:
                full_path = Path(root) / filename
                rel_path = full_path.relative_to(project_path)
                files.append(str(rel_path))
        
        return files
    
    def flatten_file_structure(self, file_structure: List[FileNode]) -> List[FileNode]:
        """
        Flatten nested file structure into a list
        
        Args:
            file_structure: Nested file structure
            
        Returns:
            List[FileNode]: Flattened list of files and directories
        """
        flat_list = []
        
        def traverse(nodes: List[FileNode]):
            for node in nodes:
                flat_list.append(node)
                if node.children:
                    traverse(node.children)
        
        traverse(file_structure)
        return flat_list
    
    def clean_old_projects(self, max_age_hours: int = 24):
        """
        Clean up old project directories
        
        Args:
            max_age_hours: Maximum age in hours before deletion
        """
        import time
        current_time = time.time()
        
        for project_dir in self.base_path.iterdir():
            if project_dir.is_dir():
                dir_age = current_time - project_dir.stat().st_mtime
                if dir_age > (max_age_hours * 3600):
                    shutil.rmtree(project_dir)

