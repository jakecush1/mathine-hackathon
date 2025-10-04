"""Document models for the autograder."""

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class DocumentChunk:
    """Represents a chunk of text from a document."""
    
    text: str
    page_number: Optional[int] = None
    chunk_index: int = 0
    metadata: dict = field(default_factory=dict)
    embedding: Optional[List[float]] = None


@dataclass
class Document:
    """Represents a processed document."""
    
    text: str
    source: str
    num_pages: int = 0
    chunks: List[DocumentChunk] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)


@dataclass
class GradingResult:
    """Result of grading a submission."""
    
    score: float
    max_score: float
    feedback: str
    detailed_feedback: List[dict] = field(default_factory=list)
    rubric_items: List[dict] = field(default_factory=list)
