# Import patches first (before langchain imports)
import groq_client_patch
import sys

from langchain_groq import ChatGroq

# Apply ChatGroq patch after import
if hasattr(sys, '_patch_chatgroq'):
    sys._patch_chatgroq()

from langchain_core.messages import SystemMessage, HumanMessage
from config import settings
from typing import Optional, Dict, Any
import json
import os


class GroqService:
    """Service for interacting with Groq LLM via LangChain"""
    
    def __init__(self):
        # Set API key as environment variable to avoid parameter passing issues
        os.environ['GROQ_API_KEY'] = settings.groq_api_key
        
        self.model_name = "llama-3.1-70b-versatile"
        self.llm = ChatGroq(
            model=self.model_name,
            temperature=0.7,
            max_tokens=8000,
        )
        
    async def generate_structured_response(
        self, 
        system_prompt: str, 
        user_prompt: str,
        temperature: float = 0.7
    ) -> str:
        """
        Generate a response from Groq LLM
        
        Args:
            system_prompt: System instructions for the LLM
            user_prompt: User query
            temperature: Creativity level (0-1)
            
        Returns:
            str: LLM response
        """
        try:
            # Create a new LLM instance with custom temperature if needed
            llm = ChatGroq(
                model=self.model_name,
                temperature=temperature,
                max_tokens=8000,
            )
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = await llm.ainvoke(messages)
            return response.content
            
        except Exception as e:
            print(f"Error in Groq API call: {str(e)}")
            raise
    
    async def generate_with_retry(
        self,
        system_prompt: str,
        user_prompt: str,
        expected_format: str = "json",
        max_retries: int = 3
    ) -> str:
        """
        Generate response with retry logic for malformed responses
        
        Args:
            system_prompt: System instructions
            user_prompt: User query
            expected_format: Expected response format (json, markdown, code)
            max_retries: Maximum retry attempts
            
        Returns:
            str: Valid LLM response
        """
        for attempt in range(max_retries):
            try:
                response = await self.generate_structured_response(
                    system_prompt, 
                    user_prompt
                )
                
                # Validate response format
                if expected_format == "json":
                    # Try to parse as JSON to validate
                    json.loads(response)
                
                return response
                
            except json.JSONDecodeError:
                if attempt < max_retries - 1:
                    # Retry with more explicit instructions
                    system_prompt += "\n\nIMPORTANT: Return ONLY valid JSON without any markdown formatting or additional text."
                    continue
                else:
                    raise ValueError("Failed to generate valid JSON response after retries")
            except Exception as e:
                if attempt < max_retries - 1:
                    continue
                else:
                    raise
        
        raise Exception("Failed to generate response after maximum retries")
    
    def extract_json_from_response(self, response: str) -> Dict[Any, Any]:
        """
        Extract JSON from response that might contain markdown formatting
        
        Args:
            response: Raw LLM response
            
        Returns:
            dict: Parsed JSON object
        """
        # Remove markdown code blocks if present
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        elif response.startswith("```"):
            response = response[3:]
        
        if response.endswith("```"):
            response = response[:-3]
        
        response = response.strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {response[:200]}...")
            raise ValueError(f"Invalid JSON response: {str(e)}")
