"""Lightweight vector store implementation using dictionaries."""

import numpy as np
from typing import List, Dict, Optional
import structlog

from models.document import DocumentChunk

logger = structlog.get_logger(__name__)


class SimpleVectorStore:
    """
    Simple in-memory vector store using cosine similarity.
    Stores embeddings and performs similarity search.
    """
    
    def __init__(self):
        """Initialize the vector store."""
        self.chunks: List[DocumentChunk] = []
        self.embeddings: Optional[np.ndarray] = None
        self.metadata: List[Dict] = []
    
    def add_chunks(self, chunks: List[DocumentChunk]):
        """
        Add document chunks to the vector store.
        
        :param chunks: List of DocumentChunk objects with embeddings
        """
        for chunk in chunks:
            if chunk.embedding is None:
                logger.warning("Chunk has no embedding, skipping")
                continue
            
            self.chunks.append(chunk)
            self.metadata.append({
                "text": chunk.text,
                "page": chunk.page_number,
                "chunk_index": chunk.chunk_index,
                **chunk.metadata
            })
        
        # Convert embeddings to numpy array for efficient computation
        embeddings_list = [chunk.embedding for chunk in self.chunks]
        self.embeddings = np.array(embeddings_list)
        
        logger.info(f"Added {len(chunks)} chunks to vector store. Total: {len(self.chunks)}")
    
    def similarity_search(
        self, 
        query_embedding: List[float], 
        k: int = 5
    ) -> List[Dict]:
        """
        Search for most similar chunks to query.
        
        :param query_embedding: Query embedding vector
        :param k: Number of results to return
        :return: List of dictionaries with chunk info and similarity scores
        """
        if self.embeddings is None or len(self.embeddings) == 0:
            logger.warning("Vector store is empty")
            return []
        
        # Compute cosine similarity
        query_vec = np.array(query_embedding).reshape(1, -1)
        similarities = self._cosine_similarity(query_vec, self.embeddings)[0]
        
        # Get top k indices
        top_k_indices = np.argsort(similarities)[::-1][:k]
        
        results = []
        for idx in top_k_indices:
            results.append({
                "chunk": self.chunks[idx],
                "similarity": float(similarities[idx]),
                "text": self.chunks[idx].text,
                "metadata": self.metadata[idx]
            })
        
        return results
    
    @staticmethod
    def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> np.ndarray:
        """
        Compute cosine similarity between vectors.
        
        :param a: First vector(s)
        :param b: Second vector(s)
        :return: Similarity scores
        """
        # Normalize vectors
        a_norm = a / (np.linalg.norm(a, axis=1, keepdims=True) + 1e-10)
        b_norm = b / (np.linalg.norm(b, axis=1, keepdims=True) + 1e-10)
        
        # Compute dot product
        return np.dot(a_norm, b_norm.T)
    
    def clear(self):
        """Clear all stored chunks and embeddings."""
        self.chunks = []
        self.embeddings = None
        self.metadata = []
        logger.info("Vector store cleared")
