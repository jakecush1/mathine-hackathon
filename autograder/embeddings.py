"""Embedding generation using OpenAI API."""

from typing import List
import openai
import structlog

from models.document import DocumentChunk

logger = structlog.get_logger(__name__)


class EmbeddingGenerator:
    """Generates embeddings using OpenAI's API."""
    
    def __init__(self, api_key: str, model: str = "text-embedding-3-small"):
        """
        Initialize embedding generator.
        
        :param api_key: OpenAI API key
        :param model: Embedding model name
        """
        self.client = openai.OpenAI(api_key=api_key)
        self.model = model
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        :param text: Text to embed
        :return: Embedding vector
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        
        :param texts: List of texts to embed
        :return: List of embedding vectors
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=texts
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise
    
    def embed_chunks(self, chunks: List[DocumentChunk]) -> List[DocumentChunk]:
        """
        Add embeddings to document chunks.
        
        :param chunks: List of DocumentChunk objects
        :return: Chunks with embeddings added
        """
        logger.info(f"Generating embeddings for {len(chunks)} chunks")
        
        # Extract texts
        texts = [chunk.text for chunk in chunks]
        
        # Generate embeddings in batches (OpenAI allows up to 2048 texts per request)
        batch_size = 100
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            batch_embeddings = self.generate_embeddings_batch(batch_texts)
            all_embeddings.extend(batch_embeddings)
            logger.info(f"Generated embeddings for batch {i//batch_size + 1}")
        
        # Add embeddings to chunks
        for chunk, embedding in zip(chunks, all_embeddings):
            chunk.embedding = embedding
        
        return chunks
