"""Example usage of the autograder."""

import io
from autograder.config import AutograderConfig
from autograder.pdf_processor import PDFProcessor
from autograder.grader import Autograder


def example_usage():
    """Demonstrate basic autograder usage."""
    
    # Initialize configuration
    config = AutograderConfig.from_env()
    
    # Create PDF processor
    pdf_processor = PDFProcessor(
        chunk_size=config.chunk_size,
        chunk_overlap=config.chunk_overlap
    )
    
    # Initialize autograder
    grader = Autograder(config)
    
    # Load course materials (textbooks, slides, etc.)
    print("Loading course materials...")
    course_materials = [
        pdf_processor.load_pdf("path/to/textbook.pdf"),
        pdf_processor.load_pdf("path/to/lecture_slides.pdf"),
    ]
    grader.add_course_materials(course_materials)
    
    # Load student submission and rubric
    print("Loading submission and rubric...")
    submission = pdf_processor.load_pdf("path/to/student_submission.pdf")
    rubric = pdf_processor.load_pdf("path/to/grading_rubric.pdf")
    
    # Grade the submission
    print("Grading submission...")
    result = grader.grade_submission(
        submission=submission,
        rubric=rubric,
        max_score=100.0
    )
    
    # Display results
    print(f"\nScore: {result.score} / {result.max_score}")
    print(f"\nFeedback:\n{result.feedback}")


if __name__ == "__main__":
    example_usage()
