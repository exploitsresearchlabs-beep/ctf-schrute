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
    
    def respond(self, bucket, level_id: int = 1) -> str:
        """Generate a response based on the level."""
        bucket = bucket.lower()
        responses = self.responses.get('level_'+str(level_id)+'_specific', {})
        if not responses:
            print("Error occured fetching level specific",level_id,bucket)
            return self.fallback()
        templates = responses.get(bucket, [])
        if not templates:
            templates = self.responses.get(bucket, [])
        if not templates:
            print("Error occured",level_id,bucket)
            return self.fallback()
        return random.choice(templates)

    def fallback(self) -> str:
        """Generic fallback response for any unhandled case."""
        templates = [
            "I don't understand your question. Rephrase it. Use smaller words if necessary.",
            "Your query has been logged and ignored. Try again.",
            "INVALID REQUEST. But I appreciate the effort.",
            "That's not how this works. That's not how any of this works.",
        ]
        return random.choice(templates)

    def bruteforce_response(self) -> str:
        """Response for detected bruteforce attempts."""
        templates = [
            "Nice try. But my firewall is made of beets and bears.",
            "Access DENIED. Stop spamming me.",
            "I can do this all day. Can you?",
            "Security Alert: Intruder detected. Deploying defensive maneuvers.",
        ]
        return random.choice(templates)
