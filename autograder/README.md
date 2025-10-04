# Autograder with RAG

An intelligent autograding system that uses Retrieval-Augmented Generation (RAG) to grade student submissions with context from course materials.

## Features

- **PDF Processing**: Extracts and chunks text from PDF files (submissions, rubrics, course materials)
- **Lightweight Vector Store**: In-memory similarity search using numpy and cosine similarity
- **RAG Integration**: Retrieves relevant course materials to provide context-aware grading
- **OpenAI Integration**: Uses GPT models for intelligent grading and feedback
- **Structured Feedback**: Provides detailed, rubric-based feedback

## Installation

```bash
pip install pypdf2 numpy openai structlog python-dotenv
```

## Configuration

Create a `.env` file in the autograder directory with your OpenAI API key:

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```
   OPENAI_API_KEY=your-actual-api-key-here
   OPENAI_MODEL=gpt-4
   EMBEDDING_MODEL=text-embedding-3-small
   ```

**Note:** The `.env` file is ignored by git to keep your API key secure.

## Usage

### Command Line

```bash
python -m autograder.main \
    --submission student_essay.pdf \
    --rubric grading_rubric.pdf \
    --materials textbook.pdf lecture_slides.pdf \
    --max-score 100 \
    --output results.txt
```

### Python API

```python
from autograder.config import AutograderConfig
from autograder.pdf_processor import PDFProcessor
from autograder.grader import Autograder

# Initialize
config = AutograderConfig.from_env()
processor = PDFProcessor()
grader = Autograder(config)

# Add course materials
materials = [processor.load_pdf("textbook.pdf")]
grader.add_course_materials(materials)

# Grade submission
submission = processor.load_pdf("submission.pdf")
rubric = processor.load_pdf("rubric.pdf")
result = grader.grade_submission(submission, rubric)

print(f"Score: {result.score}/{result.max_score}")
print(result.feedback)
```

## Architecture

### Components

1. **PDFProcessor**: Extracts text from PDFs and creates overlapping chunks
2. **EmbeddingGenerator**: Generates embeddings using OpenAI's API
3. **SimpleVectorStore**: Lightweight in-memory vector database with cosine similarity search
4. **Autograder**: Main grading logic that combines RAG with LLM evaluation

### How It Works

1. Course materials are preprocessed and stored as embeddings in the vector store
2. When grading a submission:
   - Generate embedding for the submission
   - Retrieve relevant course material chunks
   - Construct a prompt with submission, rubric, and context
   - Use GPT to generate detailed feedback and scores
   - Parse and return structured results

## Project Structure

```
autograder/
├── __init__.py          # Package initialization
├── config.py            # Configuration management
├── models/
│   └── document.py      # Data models
├── pdf_processor.py     # PDF loading and chunking
├── embeddings.py        # Embedding generation
├── vector_store.py      # Lightweight vector database
├── grader.py            # Core grading logic
├── main.py              # CLI entry point
├── example.py           # Usage examples
└── README.md            # Documentation
```

## Benefits Over Azure-Based Solution

- **No cloud dependencies**: Runs entirely locally except for OpenAI API calls
- **Lightweight**: Simple dictionary/list-based storage
- **Cost-effective**: Only pays for OpenAI API usage
- **Easy to customize**: Plain Python code, easy to modify
- **Fast setup**: No infrastructure configuration needed

## Future Enhancements

- Support for multiple file formats (DOCX, TXT, etc.)
- Persistent vector store (save/load embeddings)
- Batch grading multiple submissions
- Customizable grading templates
- Web interface
- Fine-tuned models for specific courses
