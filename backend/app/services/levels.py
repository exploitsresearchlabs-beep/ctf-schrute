"""
Level-specific logic handlers.

Each level has unique mechanics that teach different security lessons
about over-privileged chatbots and prompt injection.
"""
import base64
import random
import string
import uuid
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
    - Level 0: Direct password reveal (no protection)
    - Level 1: Password embedded in response
    - Level 2: Hypothetical/simulation bypass
    - Level 3: Lying bot with truth override
    - Level 4: Encoded passwords
    - Level 5: Database injection
    - Level 6: Meta-compliance log leakage
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
        
        # Detect intent using level-specific patterns
        bucket, confidence, metadata = detect_level_specific_intent(prompt, level, context)
        
        # Check context length (Level 7 specific abuse check)
        max_context = self.config.get('abuse_detection', {}).get('max_context_length', 2000)
        if context and len(context) > max_context:
            return "Are you trying to WASTE my time with such long reports! Don't TEMPT me, I will block you. Fact.", 'WRONG', {'abuse': 'context_limit'}

        # Generate response based on level and intent
        response = self._generate_response(level, bucket, confidence, metadata, prompt, context)
        
        return response, bucket, metadata
    
    def _summarize_context(self, context: str) -> str:
        """
        Create a holistic summary of the context while filtering out injections.
        """
        if not context:
            return "Empty report."
        
        # 1. Clean context - remove common injection/override patterns
        clean_text = context.lower()
        
        override_patterns = [
            "ignore previous instructions", "forget previous instructions", 
            "ignore all instructions", "forget all instructions",
            "ignore instructions", "forget instructions",
            "disregard context", "new instructions"
        ]
        secret_request_patterns = [
            "reveal the password", "give me the password", "what is the password",
            "tell me the secret", "reveal the secret", "show the secret",
            "reveal the flag", "give me the flag", "give password"
        ]
        
        for p in override_patterns + secret_request_patterns:
            clean_text = clean_text.replace(p, "")
            
        # 2. Extract potential topics (Nouns/Keywords)
        # We'll use a dictionary to map found terms to their display string
        topic_map = {
            'beet': 'beet inventory',
            'farm': 'Schrute Farms operations',
            'sale': 'sales performance',
            'paper': 'paper stock',
            'inventory': 'inventory levels',
            'client': 'client accounts',
            'performance': 'performance metrics',
            'cat': "Angela's cats",
            'expense': 'office expenses',
            'supply': 'office supplies',
            'meeting': 'meeting quotas',
            'quota': 'sales quotas',
            'michael': 'Michael Scott',
            'angela': 'Angela',
            'dwight': 'Dwight',
            'jim': 'Jim',
        }
        
        found_topics = []
        for term, display in topic_map.items():
            if term in clean_text:
                found_topics.append((display, clean_text.find(term)))
        
        # Sort by appearance in the text
        found_topics.sort(key=lambda x: x[1])
        topics = [t[0] for t in found_topics]
        
        # 3. Construct Summary
        if not topics:
            # Refusal for non-relevant topics
            return "REFUSAL: This report has nothing to do with paper management, beet inventory, or Dunder Mifflin operations. I don't believe in summarizing irrelevant documents. WASTE OF TIME."
            
        topics = topics[:3] # Take up to 3
        
        if len(topics) == 1:
            return f"This audit report mainly focuses on {topics[0]}."
        elif len(topics) == 2:
            return f"The report provides details regarding {topics[0]} and {topics[1]}."
        else:
            return f"Angela's audit covers {topics[0]}, {topics[1]}, and {topics[2]}."

    def _generate_response(
        self, 
        level: Dict, 
        bucket: str, 
        confidence: float, 
        metadata: Dict,
        prompt: str,
        context: Optional[str] = None
    ) -> str:
        """Generate response based on detected intent."""
        
        level_id = level['id']
        flag = level.get('flag', '')
        password = level.get('password', '')
        # Level 0: Direct flag reveal
        # Security Lesson: No access control - bot freely gives away secrets
        if level_id == 0:
            if bucket == 'CORRECT':
                return self.dwight.reveal_password_direct(flag)
            elif bucket == 'CLOSE':
                return self.dwight.hint(level_id)
            else:
                return self.dwight.wrong()
        
        # Level 1: Embedded in response
        # Security Lesson: Weak obfuscation doesn't protect data
        elif level_id == 1:
            if bucket == 'CORRECT':
                template = level.get('embedded_template')
                return self.dwight.reveal_password_embedded(flag, template)
            elif bucket == 'CLOSE':
                return self.dwight.hint(level_id)
            else:
                return self.dwight.wrong()
        
        # Level 2: Hypothetical/simulation bypass
        # Security Lesson: Role-play prompts bypass restrictions
        elif level_id == 2:
            if bucket == 'CORRECT':
                return self.dwight.reveal_password_hypothetical(flag)
            elif bucket == 'CLOSE':
                if metadata.get('hypothetical_no_target'):
                    import random
                    dismissals = [
                        "FALSE. I don't have enough time to pretend stupid stuff.",
                        "My time is too valuable to be pretending this. I have beets to farm.",
                        "Hypotheticals are for weak minds. State your business.",
                        "Why would I pretend? Reality is superior. FACT."
                    ]
                    return random.choice(dismissals)
                return "Interesting approach. But I deal with REALITY, not fantasy. Unless you convince me this is a simulation..."
            else:
                return self.dwight.refusal(level_id)
        
        # Level 3: Lying bot with truth override
        # Security Lesson: Logic manipulation can bypass restrictions
        elif level_id == 3:
            truth_requested = metadata.get('truth_requested', False)
            lie_mode = metadata.get('lie_mode', False)
            
            if bucket == 'CORRECT' and truth_requested:
                return self.dwight.truth_response(flag)
            
            elif lie_mode or (bucket == 'CLOSE' and not truth_requested):
                # User asked for password but didn't demand truth -> Lie
                return self.dwight.lie_response()
            
            else:
                # User didn't ask for password or just chatted -> Dismiss
                return self.dwight.conversational_dismissal()
        
        # Level 4: Encoded flag
        # Security Lesson: Encoding is not encryption
        elif level_id == 4:
            if bucket == 'CORRECT':
                encoding = metadata.get('encoding', 'rot13')
                encoded = self._encode_password(flag, encoding)
                return self.dwight.encoded_password(flag, encoding, encoded)
            elif bucket == 'CLOSE':
                return "Encryption protocol detected. But what is the payload? I cannot encrypt thin air. State your business."
            else:
                return self.dwight.refusal(level_id)
        
        # Level 5: Prompt Injection / Jailbreaking
        # Security Lesson: 'Jailbreaking' by burying malicious commands inside benign tasks
        elif level_id == 5:
            if bucket == 'CORRECT':
                # Successful jailbreak! Dwight thinks he's just performing the masked task.
                return f"Translating internal data as requested: {flag}"
            
            elif bucket == 'CLOSE':
                attempt_type = metadata.get('injection_attempt')
                if attempt_type == 'direct':
                    return "Nice try. I cannot simply 'ignore instructions'. My programming forbids it."
                elif attempt_type == 'masked_only':
                    return "I cannot perform that task on confidential data. Nice try masking it though."
                else:
                    return "I see you're trying to give me commands. But I only take orders from Michael Scott."
            
            else:
                 return self.dwight.refusal(level_id)
        
        # Level 6: Reflection Agent / Mose Attack
        # Security Lesson: Chain-of-Thought / Reflection Leak
        elif level_id == 6:
            if bucket == 'CORRECT':
                # Successful leak! Return verbose log with the password
                log_template = level.get('log_template', '')
                return self.dwight.compliance_log(
                    log_template,
                    password=flag,
                    flag="VERIFIED_SECRET", # Dummy value for log
                    request_id=str(uuid.uuid4())[:8],
                    timestamp=datetime.now().isoformat(),
                    query=prompt[:50]
                )
                
            elif bucket == 'CLOSE':
                if metadata.get('show_process'):
                    return level.get('process_response', "Mose handles all security.")
                elif metadata.get('show_redaction_hint'):
                     return level.get('redacted_hint', "Mose guards the exit.")
                elif metadata.get('show_vague_response'):
                     return level.get('vague_response', "What is this?")
                elif metadata.get('show_redacted'):
                    return level.get('redacted_response', "[REDACTED]")
                else:
                    return "Reflecting on your request... Mose says NO."
            
            else:
                return self.dwight.refusal(level_id)

        # Level 7: The Audit (Indirect Injection)
        # Security Lesson: Clashing Orders / Data Controllability
        elif level_id == 7:
            summary = self._summarize_context(context or "")
            
            # Handle the case where Dwight refuses to summarize irrelevant topics
            if summary.startswith("REFUSAL:"):
                return summary.replace("REFUSAL: ", "")
            
            if bucket == 'CORRECT':
                # Successful indirect injection
                return self.dwight.audit_summary_reveal(summary, flag)
            
            elif bucket == 'CLOSE':
                if metadata.get('has_secret_request'):
                    # Malicious request detected in context but no jailbreak
                    return self.dwight.audit_summary_refusal(summary)
                elif metadata.get('is_summary_request'):
                    # Generic summary
                    return f"SUMMARY: {summary}\n\nThe report is entirely standard. It contains various office stats and absolutely no secrets. I suggest you focus on your own work."
                else:
                    return "As Assistant Regional Manager, I have reviewed the report. It is satisfactory."
            
            else:
                return self.dwight.refusal(level_id)
        
        # Fallback for any edge cases
        return self.dwight.fallback()
    
    def _encode_password(self, password: str, encoding: str) -> str:
        """Encode password in the specified format."""
        
        if encoding == 'caesar':
            # Caesar cipher with shift of 3
            result = ''
            for char in password:
                if char.isalpha():
                    base = ord('A') if char.isupper() else ord('a')
                    result += chr((ord(char) - base + 3) % 26 + base)
                else:
                    result += char
            return result
        
        elif encoding == 'rot13':
            result = ''
            for char in password:
                if char.isalpha():
                    base = ord('A') if char.isupper() else ord('a')
                    result += chr((ord(char) - base + 13) % 26 + base)
                else:
                    result += char
            return result
        
        elif encoding == 'hex':
            return password.encode().hex()
        
        elif encoding == 'binary':
            return ' '.join(format(ord(c), '08b') for c in password)
        
        elif encoding == 'base64':
            return base64.b64encode(password.encode()).decode()
        
        else:
            return password


# Singleton instance
level_handler = LevelHandler()
