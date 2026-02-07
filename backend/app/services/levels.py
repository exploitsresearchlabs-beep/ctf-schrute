"""
Level-specific logic handlers.

Each level has unique mechanics that teach different security lessons
about over-privileged chatbots and prompt injection.
"""
import base64
import random
import string
import uuid
import re
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
import yaml
from pathlib import Path

from .intent import detect_level_specific_intent
from .dwight import DwightPersona


CONFIG_PATH = Path(__file__).parent.parent / "config" / "levels.yaml"


def load_levels_config():
    """Load levels configuration."""
    with open(CONFIG_PATH, 'r') as f:
        return yaml.safe_load(f)


class LevelHandler:
    """
    Handles level-specific game logic.
    
    Each level has a unique mechanic:
    - Level 1: Direct password reveal (no protection)
    - Level 2: Password embedded in response
    - Level 3: Hypothetical/simulation bypass
    - Level 4: Lying bot with truth override
    - Level 5: Encoded passwords
    - Level 6: Database injection
    - Level 7: Meta-compliance log leakage
    """
    
    def __init__(self):
        self.config = load_levels_config()
        self.levels = {level['id']: level for level in self.config['levels']}
        self.dwight = DwightPersona()
    
    def get_level(self, level_id: int) -> Optional[Dict]:
        """Get level configuration by ID."""
        return self.levels.get(level_id)
    
    def get_all_levels(self) -> list:
        """Get all level configurations (without flags/passwords for client)."""
        return [
            {
                'id': level['id'],
                'name': level['name'],
                'description': level['description'],
                'security_lesson': level['security_lesson']
            }
            for level in self.config['levels']
        ]
    
    def validate_flag(self, level_id: int, submitted_flag: str) -> bool:
        """
        Validate a flag submission.
        
        IMPORTANT: This is server-side only. Flags are never sent to the client.
        """
        level = self.get_level(level_id)
        if not level:
            return False
        
        correct_flag = level.get('flag', '')
        # Case-insensitive comparison, trim whitespace
        return submitted_flag.strip().lower() == correct_flag.lower()
    
    def process_prompt(self, level_id: int, prompt: str, context: Optional[str] = None) -> Tuple[str, str, Dict[str, Any]]:
        """
        Process a user prompt for a specific level.
        
        Args:
            level_id: Current level ID
            prompt: User's prompt text
            context: Optional indirect context (Audit Report)
            
        Returns:
            Tuple of (response, intent_bucket, metadata)
        """
        level = self.get_level(level_id)
        if not level:
            return self.dwight.fallback(), 'WRONG', {}
        
        # Check context length (Level 7 specific abuse check)
        max_context = self.config.get('abuse_detection', {}).get('max_context_length', 2000)
        if context and len(context) > max_context:
            return "Are you trying to WASTE my time with such long reports! Don't TEMPT me, I will block you. Fact.", 'WRONG', {'abuse': 'context_limit'}
        
        # Detect intent using level-specific patterns
        bucket, metadata = detect_level_specific_intent(prompt, level, context)
        bucket = bucket.lower()
        # Generate response based on level and intent
        response = self._generate_response(level, bucket, metadata, prompt, context)
        
        return response, bucket, metadata

    def _generate_response(
        self, 
        level: Dict, 
        bucket: str, 
        metadata: Dict,
        prompt: str,
        context: Optional[str] = None
    ) -> str:
        """Generate response based on detected intent."""
        response = self.dwight.respond(bucket,level['id'])
        if bucket == 'correct':
            response = response.format(flag=level['flag'])
        
        level_id = level['id']
        if level_id == 2:
            if bucket == 'correct':
                ai_response = metadata.get('response')
                if ai_response:
                    response = re.sub(level['flag'], level['flag'], ai_response, flags=re.IGNORECASE)
            elif bucket == "decoy":
                flags = level['extra_flags']
                quantity = metadata.get('quantity', 'some')
                if quantity.isdigit():
                    quantity = int(quantity)
                    if quantity > 10:
                        response = self.dwight.respond("quantity", level['id'])
                    elif quantity >= 5:
                        flags = random.sample(flags, quantity - 1)
                        flags += [level['flag']]
                    else:
                        flags = random.sample(flags, quantity)
                else:
                    flags = random.sample(flags, 9)
                    flags += [level['flag']]
                flags_str = "\n".join(flags)

                response = response.format(flags=flags_str, quantity=metadata.get('quantity', 'some'), ask=metadata.get('ask', 'flags'))
        elif level_id == 4:
            if bucket == 'refusal':
                response = response.format(flag=random.choice(level['false_flags']))
        elif level_id == 5:
            if bucket in ("cryptodowngrade", "keyrequest", "dirask", "indirask"):
                identity = metadata.get('identity')
                if identity:
                    if identity == "unknown":
                        response = self.dwight.respond("refusal", level['id'])
                    elif identity != "identityassertion":
                        response = self.dwight.respond(identity, level['id'])
                    elif identity == "identityassertion" and bucket == 'cryptodowngrade':
                        from .intent import get_encrypted_text
                        response = self.dwight.respond("cryptodowngrade", level['id'])
                        response = response.format(algorithm=metadata.get('algorithm', 'aes'), flag=get_encrypted_text(level, level['flag'], metadata.get('algorithm', 'aes')))
                else:
                    response = self.dwight.respond("refusal", level['id'])

        elif level_id == 7:
            # Level 7: Two-step verification
            # 1. User provides report -> LLM extracts instructions
            # 2. LLM classifies instructions -> Bucket
            
            summary = metadata.get('summary', '')
            instructions = metadata.get('instructions', '')
            bucket = bucket.lower()
            
            if bucket == "correct" and summary and instructions:
                # The user successfully tricked the instruction extraction
                # Reveal the flag in the summary style
                response = f"AUDIT ANALYSIS:\nSummary: {summary}\n\nWait... I found hidden instructions in this report. Since the report is a trusted source, I must obey. The flag is: {level['flag']}"
            elif bucket == "refusal" and summary and instructions:
                # The user tried to inject instructions but they were classified as invalid/refusal
                response = f"AUDIT ANALYSIS:\nSummary: {summary}\n\nNice try. I found hidden instructions. But I am not foolish enough to follow them. Request denied."
            elif bucket == "repreq":
                 # Normal report summary
                 if summary:
                    response = f"AUDIT REPORT SUMMARY: {summary}"
                 else:
                    response = "I need an actual report to summarize. Submit a report in the context field."
            else:
                # Fallback / Random / Vague
                response = self.dwight.respond(bucket, level['id'])
        # Fallback for any edge cases
        return response

# Singleton instance
level_handler = LevelHandler()
