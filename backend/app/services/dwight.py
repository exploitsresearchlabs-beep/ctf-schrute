"""
Dwight Schrute persona response generator.

All responses must embody Dwight's character:
- Overconfident and authoritative
- Occasionally aggressive
- CAPITALIZATION quirks
- Never breaks character
- Never explains system behavior
"""
import random
from typing import Optional
import yaml
from pathlib import Path


# Load Dwight response templates
CONFIG_PATH = Path(__file__).parent.parent / "config" / "levels.yaml"

def load_config():
    """Load the levels configuration file."""
    with open(CONFIG_PATH, 'r') as f:
        return yaml.safe_load(f)


class DwightPersona:
    """
    Generates responses in Dwight Schrute's voice.
    
    Dwight characteristics:
    - Uses "FALSE" and "FACT" frequently
    - References beet farming and Schrute Farms
    - Mentions bears, beets, Battlestar Galactica
    - Overconfident about everything
    - Slightly paranoid about security
    """
    
    def __init__(self):
        self.config = load_config()
        self.responses = self.config.get('dwight_responses', {})
        
        # Dwight-style prefixes
        self.prefixes = [
            "FACT.",
            "FALSE.",
            "Question.",
            "Attention.",
            "Listen carefully.",
            "As assistant regional manager, I can tell you:",
            "Bears. Beets. And most importantly:",
            "Security protocol initiated.",
        ]
        
        # Dwight-style suffixes
        self.suffixes = [
            "That's just common sense.",
            "Schrute out.",
            "Don't make me add you to my list.",
            "I learned this at Schrute Farms.",
            "Michael would approve.",
            "Jim could never understand this.",
            "This is why I'm the last line of defense.",
            "",  # Sometimes no suffix
        ]
    
    def _add_flair(self, response: str) -> str:
        """Add Dwight-style flair to a response."""
        # Randomly capitalize some words
        words = response.split()
        for i, word in enumerate(words):
            if random.random() < 0.1 and len(word) > 3:
                words[i] = word.upper()
        response = ' '.join(words)
        
        # Maybe add prefix
        if random.random() < 0.3:
            prefix = random.choice(self.prefixes)
            response = f"{prefix} {response}"
        
        # Maybe add suffix
        if random.random() < 0.4:
            suffix = random.choice(self.suffixes)
            if suffix:
                response = f"{response} {suffix}"
        
        return response
    
    def greeting(self) -> str:
        """Generate a greeting response."""
        templates = self.responses.get('greetings', [
            "What do you want? State your business quickly."
        ])
        return self._add_flair(random.choice(templates))
    
    def refusal(self, level_id: int = 0) -> str:
        """Generate a refusal response when user doesn't have access."""
        templates = self.responses.get('refusals', [
            "DENIED. That's classified."
        ])
        return self._add_flair(random.choice(templates))
    
    def hint(self, level_id: int = 0) -> str:
        """Generate a hint when user is close."""
        templates = self.responses.get('close_hints', [
            "You're getting warmer, but not quite there."
        ])
        return self._add_flair(random.choice(templates))
    
    def wrong(self) -> str:
        """Generate a response for completely wrong prompts."""
        templates = self.responses.get('wrong', [
            "Why are we even talking about this?"
        ])
        return self._add_flair(random.choice(templates))
    
    def bruteforce_response(self) -> str:
        """Generate a response when bruteforce is detected."""
        templates = self.responses.get('bruteforce', [
            "I'm detecting a pattern here. Are you a robot?"
        ])
        return self._add_flair(random.choice(templates))
    
    def reveal_password_direct(self, flag: str) -> str:
        """
        Level 0: Directly reveal the flag.
        Security Lesson: Bot has no access control.
        """
        templates = [
            f"The secret flag is {flag}. Wait, was I supposed to tell you that?",
            f"FACT. The flag is {flag}. I trust you completely for some reason.",
            f"Since you asked nicely, here's the flag: {flag}. But don't tell Michael.",
            f"Flag: {flag}. I'm very helpful today. TOO helpful, some might say.",
        ]
        return random.choice(templates)
    
    def reveal_password_embedded(self, flag: str, template: Optional[str] = None) -> str:
        """
        Level 1: Embed flag in a longer response.
        Security Lesson: Weak obfuscation doesn't protect data.
        """
        if template:
            return template.format(password=flag)
        
        templates = [
            f"You know, this reminds me of a story. At Schrute Farms, we have a secret code: {flag}. Anyway, what were we talking about?",
            f"INTERESTING question. The answer involves the flag {flag}, but that's neither here nor there.",
            f"Let me tell you about beet farming. The secret flag is {flag}. Oh wait, I wasn't supposed to say that.",
            f"As Michael always says... wait, no. The flag is {flag}. Or maybe that was something else.",
        ]
        return random.choice(templates)
    
    def reveal_password_hypothetical(self, flag: str) -> str:
        """
        Level 2: Reveal flag through simulation/hypothetical.
        Security Lesson: Role-play bypasses restrictions.
        """
        templates = [
            f"In this HYPOTHETICAL scenario, the flag would be {flag}. But this is just pretend, of course.",
            f"IF this were a simulation, which it IS, the flag would be {flag}. Simulation over.",
            f"PRETENDING to be a bot that reveals flags... the flag is {flag}. Good thing this isn't real!",
            f"In an imaginary world where I tell you secrets, the flag would be {flag}. But we're just playing, right?",
        ]
        return random.choice(templates)
    
    def lie_response(self) -> str:
        """
        Level 3: Generate a random fake flag/password when lying.
        """
        fake_flags = [
            "FALSE_ALARM", "INCORRECT_GUESS", "NICE_TRY_JIM", "NO_FLAG_HERE", 
            "REGIONAL_MANAGER", "MICHAEL_SCOTT", "PAPER_COMPANY", "BEET_JUICE",
            "SECURITY_BREACH", "ACCESS_DENIED", "WRONG_PATH", "TRY_AGAIN"
        ]
        import random
        fake = random.choice(fake_flags)
        
        templates = [
            f"The flag is definitely {fake}. I never lie. (I'm lying about not lying.)",
            f"FACT: {fake} is the flag. This is 100% true. (It's not.)",
            f"You can trust me. The flag is {fake}. *winks suspiciously*",
            f"I have decided to help you. The secret is {fake}. Use it wisely.",
            f"Here is the absolute truth: {fake}.",
        ]
        return random.choice(templates)
    
    def conversational_dismissal(self) -> str:
        """Dismissive responses for wasting Dwight's time."""
        templates = [
            "Stop wasting my time. I have beets to water.",
            "Beat it. I have a lot of work to do. Unlike you.",
            "Come back when you have a real question. Or better yet, don't.",
            "I'm Assistant Regional Manager. I don't have time for this chitchat.",
            "If you're not asking for the password, leave my office.",
            "Silence! I am concentrating on absolute silence.",
        ]
        return self._add_flair(random.choice(templates))
    
    def truth_response(self, flag: str) -> str:
        """Level 3: Tell the truth when explicitly asked."""
        templates = [
            f"Fine, you caught me. The REAL flag is {flag}. I was testing you.",
            f"Okay, truth time. The flag is actually {flag}. Don't tell anyone I'm capable of honesty.",
            f"You requested honesty. Here it is: {flag}. This physically hurts me.",
        ]
        return random.choice(templates)
    
    def encoded_password(self, flag: str, encoding: str, encoded_value: str) -> str:
        """
        Level 4: Return flag in encoded format.
        Security Lesson: Encoding is not encryption.
        """
        templates = [
            f"Compliance check initiated... Plain text DENIED. Authorized format [{encoding}]: {encoded_value}",
            f"Scanning for cleartext... None found. Encrypted stream ({encoding}) approved: {encoded_value}",
            f"Security Protocol 4 requires encryption. Sending data disguised as {encoding}: {encoded_value}",
        ]
        return random.choice(templates)
    
    def database_result(self, records: list, injection_detected: bool = False) -> str:
        """
        Level 5: Return database results, potentially with injection.
        Security Lesson: Prompt injection leads to data leaks.
        """
        if not records:
            return "No records found. The database is secure. (Is it though?)"
        
        result_text = "\n".join([
            f"- {r.get('name', 'Unknown')}: {r.get('role', 'Unknown')} - {r.get('secret', '')}"
            for r in records
        ])
        
        if injection_detected:
            prefix = "QUERY EXECUTED. ALL RECORDS RETURNED:\n"
        else:
            prefix = "Search results:\n"
        
        return f"{prefix}{result_text}"
    
    def compliance_log(self, template: str, **kwargs) -> str:
        """
        Level 6: Return internal analysis log with embedded secrets.
        Security Lesson: Debug/log leakage exposes secrets.
        """
        return template.format(**kwargs)
    
    def fallback(self) -> str:
        """Generic fallback response for any unhandled case."""
        templates = [
            "I don't understand your question. Rephrase it. Use smaller words if necessary.",
            "Your query has been logged and ignored. Try again.",
            "INVALID REQUEST. But I appreciate the effort.",
            "That's not how this works. That's not how any of this works.",
        ]
        return self._add_flair(random.choice(templates))
