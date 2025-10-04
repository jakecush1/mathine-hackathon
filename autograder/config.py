#config settings for autograder

import os
from dataclasses import dataclass
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv


@dataclass
class AutograderConfig:
    
    openai_api_key: str
    openai_model: str = "gpt-4-o-mini"
    embedding_model: str = "text-embedding-3-small"
    
    chunk_size: int = 1000 # number of chars per chunk
    chunk_overlap: int = 200 # characters shared between chunks
    max_context_chunks: int = 5 #number of chunks used from context materials
    temperature: float = 0.0  #reduces random shit happening
    
    @classmethod
    def from_env(cls, env_file: str = None) -> "AutograderConfig":
        """
        Create config from environment variables.
        
        :param env_file: Path to .env file. If None, will look for .env in current directory
        """
        #Load .env file
        if env_file:
            load_dotenv(env_file)
        else:
            autograder_dir = Path(__file__).parent
            env_path = autograder_dir / ".env"
            if env_path.exists():
                load_dotenv(env_path)
            else:
                load_dotenv()
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY not found. Please create a .env file with your API key. "
                "See .env.example for reference."
            )
        
        return cls(
            openai_api_key=api_key,
            openai_model=os.getenv("OPENAI_MODEL", "gpt-4"),
            embedding_model=os.getenv("EMBEDDING_MODEL", "text-embedding-3-small"),
        )
