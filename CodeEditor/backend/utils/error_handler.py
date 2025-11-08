from typing import Dict, Any, Optional
import traceback
from models.schemas import StageType


class GenerationError(Exception):
    """Base exception for generation errors"""
    def __init__(self, message: str, stage: StageType, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.stage = stage
        self.details = details or {}
        super().__init__(self.message)


class IdeaGenerationError(GenerationError):
    """Error during idea generation stage"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, StageType.IDEA, details)


class PlanningError(GenerationError):
    """Error during planning stage"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, StageType.PLANNING, details)


class CodeGenerationError(GenerationError):
    """Error during code generation stage"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, StageType.CODING, details)


class BuildError(GenerationError):
    """Error during build stage"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, StageType.BUILDING, details)


def handle_generation_error(error: Exception) -> Dict[str, Any]:
    """
    Convert an exception to a structured error response
    
    Args:
        error: Exception to handle
        
    Returns:
        Dict containing error details
    """
    if isinstance(error, GenerationError):
        return {
            "stage": error.stage.value,
            "message": error.message,
            "details": error.details,
            "type": error.__class__.__name__
        }
    
    # Generic error handling
    return {
        "stage": "error",
        "message": str(error),
        "details": {
            "traceback": traceback.format_exc()
        },
        "type": error.__class__.__name__
    }


def format_build_error(error_output: str) -> str:
    """
    Format build error output for better readability
    
    Args:
        error_output: Raw error output from build process
        
    Returns:
        Formatted error message
    """
    # Extract key error lines
    lines = error_output.split('\n')
    error_lines = []
    
    for line in lines:
        # Common error patterns
        if any(pattern in line.lower() for pattern in ['error:', 'failed', 'cannot', 'unexpected']):
            error_lines.append(line.strip())
    
    if error_lines:
        return '\n'.join(error_lines[:10])  # Limit to first 10 errors
    
    # If no specific errors found, return last 20 lines
    return '\n'.join(lines[-20:])


def validate_prompt(prompt: str) -> tuple[bool, Optional[str]]:
    """
    Validate user prompt before processing
    
    Args:
        prompt: User prompt to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not prompt or not prompt.strip():
        return False, "Prompt cannot be empty"
    
    if len(prompt) < 10:
        return False, "Prompt is too short. Please provide more details."
    
    if len(prompt) > 5000:
        return False, "Prompt is too long. Please limit to 5000 characters."
    
    return True, None

