from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path


class Settings(BaseSettings):
    groq_api_key: Optional[str] = None
    generated_projects_path: str = "./generated_projects"
    max_build_timeout: int = 300
    preview_port_range_start: int = 9000
    preview_port_range_end: int = 10000
    frontend_url: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Check if .env exists, if not create it from .env.example
env_path = Path(__file__).parent / ".env"
env_example_path = Path(__file__).parent / ".env.example"

if not env_path.exists():
    print("⚠️  .env file not found. Creating from .env.example...")
    if env_example_path.exists():
        import shutil
        shutil.copy(env_example_path, env_path)
        print("✅ Created .env file. Please edit it and add your GROQ_API_KEY!")
    else:
        # Create .env file with template (UTF-8 without BOM)
        env_content = """GROQ_API_KEY=your_groq_api_key_here
GENERATED_PROJECTS_PATH=./generated_projects
MAX_BUILD_TIMEOUT=300
PREVIEW_PORT_RANGE_START=8000
PREVIEW_PORT_RANGE_END=9000
FRONTEND_URL=http://localhost:5173
"""
        # Write without BOM
        with open(env_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(env_content)
        print("✅ Created .env file. Please edit it and add your GROQ_API_KEY!")
    print("   Get a free API key at: https://console.groq.com")
    print()

# Load settings
settings = Settings()

# Validate API key
if not settings.groq_api_key or settings.groq_api_key == "your_groq_api_key_here" or (isinstance(settings.groq_api_key, str) and settings.groq_api_key.strip() == ""):
    print("❌ ERROR: GROQ_API_KEY not configured!")
    print()
    print("Please:")
    print("  1. Edit backend/.env file")
    print("  2. Add your Groq API key: GROQ_API_KEY=your_actual_key_here")
    print("  3. Get a free API key at: https://console.groq.com")
    print()
    raise ValueError("GROQ_API_KEY is required. Please configure it in backend/.env")

