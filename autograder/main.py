"""Main entry point for the autograder."""

import argparse
import structlog
from pathlib import Path

from config import AutograderConfig
from pdf_processor import PDFProcessor
from grader import Autograder

logger = structlog.get_logger(__name__)


def main():
    """Run the autograder CLI."""
    parser = argparse.ArgumentParser(description="Autograder with RAG support")
    parser.add_argument("--submission", required=True, help="Path to student submission PDF")
    parser.add_argument("--rubric", required=True, help="Path to grading rubric PDF")
    parser.add_argument("--materials", nargs="+", help="Paths to course material PDFs")
    parser.add_argument("--max-score", type=float, default=100.0, help="Maximum score")
    parser.add_argument("--output", help="Output file for grading results")
    
    args = parser.parse_args()
    
    # Load configuration
    config = AutograderConfig.from_env()
    
    # Initialize components
    pdf_processor = PDFProcessor(
        chunk_size=config.chunk_size,
        chunk_overlap=config.chunk_overlap
    )
    autograder = Autograder(config)
    
    # Load course materials if provided
    if args.materials:
        logger.info(f"Loading {len(args.materials)} course material documents")
        course_docs = []
        for material_path in args.materials:
            doc = pdf_processor.load_pdf(file_path=material_path)
            course_docs.append(doc)
        autograder.add_course_materials(course_docs)
    
    # Load submission and rubric
    logger.info("Loading submission and rubric")
    submission = pdf_processor.load_pdf(file_path=args.submission)
    rubric = pdf_processor.load_pdf(file_path=args.rubric)
    
    # Grade the submission
    logger.info("Grading submission...")
    result = autograder.grade_submission(
        submission=submission,
        rubric=rubric,
        max_score=args.max_score
    )
    
    # Output results
    output_text = f"""
{'='*60}
GRADING RESULTS
{'='*60}

Score: {result.score} / {result.max_score}

{result.feedback}

{'='*60}
"""
    
    print(output_text)
    
    if args.output:
        output_path = Path(args.output)
        output_path.write_text(output_text)
        logger.info(f"Results written to {output_path}")


if __name__ == "__main__":
    main()
