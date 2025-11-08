import asyncio
import subprocess
from pathlib import Path
from typing import Optional
import socket
import threading
import http.server
import socketserver
from models.schemas import BuildResult, ProjectType
from config import settings


class BuildService:
    """Handles building and serving generated projects"""
    
    def __init__(self):
        self.active_servers = {}
        self.port_range_start = settings.preview_port_range_start
        self.port_range_end = settings.preview_port_range_end
    
    def find_available_port(self) -> int:
        """Find an available port in the configured range"""
        for port in range(self.port_range_start, self.port_range_end):
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(('', port))
                    return port
            except OSError:
                continue
        raise RuntimeError("No available ports in configured range")
    
    async def build_react_vite(self, project_path: Path) -> BuildResult:
        """
        Build a React + Vite project
        
        Args:
            project_path: Path to project directory
            
        Returns:
            BuildResult: Build result with preview URL
        """
        logs = []
        
        try:
            # Install dependencies
            logs.append("Installing dependencies...")
            install_process = await asyncio.create_subprocess_exec(
                'npm', 'install',
                cwd=str(project_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(
                install_process.communicate(),
                timeout=settings.max_build_timeout
            )
            
            if install_process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown error during npm install"
                logs.append(f"Install failed: {error_msg}")
                return BuildResult(
                    success=False,
                    error=error_msg,
                    logs="\n".join(logs)
                )
            
            logs.append("Dependencies installed successfully")
            
            # Build the project
            logs.append("Building project...")
            build_process = await asyncio.create_subprocess_exec(
                'npm', 'run', 'build',
                cwd=str(project_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(
                build_process.communicate(),
                timeout=settings.max_build_timeout
            )
            
            if build_process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown error during build"
                logs.append(f"Build failed: {error_msg}")
                return BuildResult(
                    success=False,
                    error=error_msg,
                    logs="\n".join(logs)
                )
            
            logs.append("Build completed successfully")
            
            # Start preview server
            dist_path = project_path / "dist"
            if not dist_path.exists():
                return BuildResult(
                    success=False,
                    error="Build directory not found",
                    logs="\n".join(logs)
                )
            
            port = self.find_available_port()
            preview_url = await self.start_static_server(dist_path, port)
            
            logs.append(f"Preview server started on {preview_url}")
            
            return BuildResult(
                success=True,
                preview_url=preview_url,
                logs="\n".join(logs)
            )
            
        except asyncio.TimeoutError:
            return BuildResult(
                success=False,
                error="Build timeout exceeded",
                logs="\n".join(logs)
            )
        except Exception as e:
            return BuildResult(
                success=False,
                error=str(e),
                logs="\n".join(logs)
            )
    
    async def build_nextjs(self, project_path: Path) -> BuildResult:
        """Build a Next.js project"""
        logs = []
        
        try:
            # Install dependencies
            logs.append("Installing dependencies...")
            install_process = await asyncio.create_subprocess_exec(
                'npm', 'install',
                cwd=str(project_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(
                install_process.communicate(),
                timeout=settings.max_build_timeout
            )
            
            if install_process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown error"
                return BuildResult(
                    success=False,
                    error=error_msg,
                    logs="\n".join(logs)
                )
            
            logs.append("Dependencies installed")
            
            # Build Next.js project
            logs.append("Building Next.js project...")
            build_process = await asyncio.create_subprocess_exec(
                'npm', 'run', 'build',
                cwd=str(project_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(
                build_process.communicate(),
                timeout=settings.max_build_timeout
            )
            
            if build_process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Build failed"
                return BuildResult(
                    success=False,
                    error=error_msg,
                    logs="\n".join(logs)
                )
            
            logs.append("Build completed")
            
            # For Next.js, we need to run the production server
            port = self.find_available_port()
            preview_url = f"http://localhost:{port}"
            
            # Start Next.js production server in background
            asyncio.create_task(self.start_nextjs_server(project_path, port))
            
            logs.append(f"Next.js server starting on {preview_url}")
            
            return BuildResult(
                success=True,
                preview_url=preview_url,
                logs="\n".join(logs)
            )
            
        except Exception as e:
            return BuildResult(
                success=False,
                error=str(e),
                logs="\n".join(logs)
            )
    
    async def build_html_css(self, project_path: Path) -> BuildResult:
        """Serve a static HTML/CSS project"""
        logs = []
        
        try:
            # No build needed for HTML/CSS, just serve
            port = self.find_available_port()
            preview_url = await self.start_static_server(project_path, port)
            
            logs.append(f"Static server started on {preview_url}")
            
            return BuildResult(
                success=True,
                preview_url=preview_url,
                logs="\n".join(logs)
            )
            
        except Exception as e:
            return BuildResult(
                success=False,
                error=str(e),
                logs="\n".join(logs)
            )
    
    async def start_static_server(self, directory: Path, port: int) -> str:
        """Start a static file server"""
        
        class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory=str(directory), **kwargs)
            
            def log_message(self, format, *args):
                pass  # Suppress log messages
        
        def run_server():
            with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
                self.active_servers[port] = httpd
                httpd.serve_forever()
        
        # Start server in a separate thread
        server_thread = threading.Thread(target=run_server, daemon=True)
        server_thread.start()
        
        # Give server a moment to start
        await asyncio.sleep(0.5)
        
        return f"http://localhost:{port}"
    
    async def start_nextjs_server(self, project_path: Path, port: int):
        """Start Next.js production server"""
        process = await asyncio.create_subprocess_exec(
            'npm', 'run', 'start', '--', '-p', str(port),
            cwd=str(project_path),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        self.active_servers[port] = process
    
    def stop_server(self, port: int):
        """Stop a running server"""
        if port in self.active_servers:
            server = self.active_servers[port]
            if isinstance(server, socketserver.TCPServer):
                server.shutdown()
            else:
                server.terminate()
            del self.active_servers[port]

