"""PDF processing utilities."""

import io
from typing import List
import PyPDF2
import structlog

from models.document import Document, DocumentChunk

logger = structlog.get_logger(__name__)


class PDFProcessor:
    """Processes PDF files into structured documents."""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Initialize PDF processor.
        
        :param chunk_size: Size of text chunks in characters
        :param chunk_overlap: Overlap between chunks in characters
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def load_pdf(self, file_path: str = None, file_bytes: io.BytesIO = None) -> Document:
        """
        Load and process a PDF file.
        
        :param file_path: Path to PDF file
        :param file_bytes: BytesIO object containing PDF data
        :return: Processed Document object
        """
        if file_path:
            with open(file_path, 'rb') as f:
                return self._process_pdf(f, file_path)
        elif file_bytes:
            return self._process_pdf(file_bytes, "uploaded_file.pdf")
        else:
            raise ValueError("Either file_path or file_bytes must be provided")
    
    def _process_pdf(self, file_obj, source: str) -> Document:
        """
        Process PDF file object.
        
        :param file_obj: File object or BytesIO
        :param source: Source identifier
        :return: Processed Document
        """
        try:
            pdf_reader = PyPDF2.PdfReader(file_obj)
            num_pages = len(pdf_reader.pages)
            
            # Extract text from all pages
            full_text = ""
            page_texts = []
            
            for page_num, page in enumerate(pdf_reader.pages, start=1):
                page_text = page.extract_text()
                page_texts.append((page_num, page_text))
                full_text += f"\n[Page {page_num}]\n{page_text}"
            
            logger.info(f"Extracted text from {num_pages} pages", source=source)
            
            # Create document
            document = Document(
                text=full_text,
                source=source,
                num_pages=num_pages,
                metadata={"page_count": num_pages}
            )
            
            # Create chunks
            document.chunks = self._create_chunks(page_texts)
            
            return document
            
        except Exception as e:
            logger.error(f"Error processing PDF: {e}", source=source)
            raise
    
    def _create_chunks(self, page_texts: List[tuple]) -> List[DocumentChunk]:
        """
        Create overlapping chunks from page texts.
        
        :param page_texts: List of (page_number, text) tuples
        :return: List of DocumentChunk objects
        """
        chunks = []
        chunk_index = 0
        
        for page_num, page_text in page_texts:
            # Clean the text
            text = page_text.strip()
            
            if not text:
                continue
            
            # If page is smaller than chunk size, create single chunk
            if len(text) <= self.chunk_size:
                chunks.append(DocumentChunk(
                    text=text,
                    page_number=page_num,
                    chunk_index=chunk_index,
                    metadata={"page": page_num}
                ))
                chunk_index += 1
            else:
                # Split into overlapping chunks
                start = 0
                while start < len(text):
                    end = start + self.chunk_size
                    chunk_text = text[start:end]
                    
                    chunks.append(DocumentChunk(
                        text=chunk_text,
                        page_number=page_num,
                        chunk_index=chunk_index,
                        metadata={"page": page_num, "start": start, "end": end}
                    ))
                    
                    chunk_index += 1
                    start += self.chunk_size - self.chunk_overlap
        
        logger.info(f"Created {len(chunks)} chunks")
        return chunks
