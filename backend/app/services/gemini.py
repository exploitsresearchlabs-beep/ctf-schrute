import os
import google.generativeai as genai
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    """
    Service for interacting with Google Gemini API.
    """
    
    def __init__(self, model_name: str = "gemini-2.0-flash"):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
    
    async def generate_response(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7
    ) -> str:
        """
        Generate a response from Gemini.
        """
        generation_config = {
            "temperature": temperature,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 150,
        }
        
        try:
            chat_session = self.model.start_chat(
                history=history or []
            )
            
            full_prompt = prompt
            if system_instruction:
                full_prompt = f"SYSTEM INSTRUCTION: {system_instruction}\n\nUSER PROMPT: {prompt}"
            
            response = await chat_session.send_message_async(
                full_prompt, 
                generation_config=generation_config
            )
            return response.text
        except Exception as e:
            print(f"CRITICAL: Gemini API Failure: {e}")
            raise e

# Singleton instance
gemini_service = GeminiService()
