"""Core grading logic using RAG."""

from typing import List, Dict
import openai
import structlog

from autograder.config import AutograderConfig
from autograder.models.document import Document, GradingResult
from autograder.vector_store import SimpleVectorStore
from autograder.embeddings import EmbeddingGenerator

logger = structlog.get_logger(__name__)


class Autograder:
    """
    Autograder that uses RAG to provide context-aware grading.
    """
    
    def __init__(self, config: AutograderConfig):
        """
        Initialize autograder.
        
        :param config: Autograder configuration
        """
        self.config = config
        self.client = openai.OpenAI(api_key=config.openai_api_key)
        self.embedding_generator = EmbeddingGenerator(
            api_key=config.openai_api_key,
            model=config.embedding_model
        )
        self.knowledge_base = SimpleVectorStore()
    
    def add_course_materials(self, documents: List[Document]):
        """
        Add course materials to the knowledge base.
        
        :param documents: List of processed course documents
        """
        logger.info(f"Adding {len(documents)} documents to knowledge base")
        
        all_chunks = []
        for doc in documents:
            all_chunks.extend(doc.chunks)
        
        # Generate embeddings for all chunks
        chunks_with_embeddings = self.embedding_generator.embed_chunks(all_chunks)
        
        # Add to vector store
        self.knowledge_base.add_chunks(chunks_with_embeddings)
        
        logger.info("Course materials added to knowledge base")
    
    def grade_submission(
        self,
        submission: Document,
        rubric: Document,
        max_score: float = 100.0
    ) -> GradingResult:
        """
        Grade a student submission against a rubric.
        
        :param submission: Student submission document
        :param rubric: Grading rubric document
        :param max_score: Maximum possible score
        :return: Grading result with score and feedback
        """
        logger.info("Starting grading process")
        
        # Validate submission has content
        submission_word_count = len(submission.text.split())
        if submission_word_count < 50:
            logger.warning(f"Submission appears empty ({submission_word_count} words)")
            return GradingResult(
                score=0.0,
                max_score=max_score,
                feedback=f"**SUBMISSION REJECTED**\n\n"
                        f"Your submission appears to be empty or too short ({submission_word_count} words). "
                        f"Please submit substantive work that addresses all assignment requirements.\n\n"
                        f"Expected: At least 50 words of actual content answering the questions."
            )
        
        # Get relevant context from course materials
        submission_embedding = self.embedding_generator.generate_embedding(
            submission.text[:2000]  # Use first 2000 chars for context
        )
        
        relevant_materials = self.knowledge_base.similarity_search(
            submission_embedding,
            k=self.config.max_context_chunks
        )
        
        # Build context from retrieved materials
        context = self._build_context(relevant_materials)
        
        # Generate grading prompt
        prompt = self._create_grading_prompt(
            submission=submission.text,
            rubric=rubric.text,
            context=context,
            max_score=max_score
        )
        
        # Call GPT for grading with strict system prompt
        response = self.client.chat.completions.create(
            model=self.config.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": self._get_strict_system_prompt()  # CHANGED: Use strict prompt
                },
                {"role": "user", "content": prompt}
            ],
            temperature=self.config.temperature,
        )
        
        # Parse response
        result = self._parse_grading_response(
            response.choices[0].message.content,
            max_score
        )
        
        logger.info(f"Grading complete. Score: {result.score}/{result.max_score}")
        return result
    
    def _get_strict_system_prompt(self) -> str:
        """Get strict system prompt that prevents hallucination."""
        return """You are an expert teaching assistant grading student submissions.

**CRITICAL GRADING RULES:**
1. If the submission is EMPTY, BLANK, or contains no substantive answers, assign a score of 0
2. Do NOT make assumptions about content that is not present in the submission
3. Do NOT give credit for missing work, even if course materials suggest what should be there
4. Only award points for work that is EXPLICITLY present and correct in the submission
5. The course materials provided are for YOUR reference - they show what students learned, NOT what this student wrote
6. Grade based ONLY on what the student actually submitted

**You must grade fairly but strictly:**
- If a question is not answered → 0 points for that question
- If an answer is partially correct → partial credit proportional to correctness
- If an answer is complete and correct → full credit

Provide fair, constructive feedback based on the rubric. Be explicit about what is missing or incorrect."""
    
    def _build_context(self, retrieved_chunks: List[Dict]) -> str:
        """
        Build context string from retrieved chunks.
        
        :param retrieved_chunks: List of retrieved chunk dictionaries
        :return: Context string
        """
        if not retrieved_chunks:
            return ""
        
        context_parts = ["### Relevant Course Materials (For Grader Reference Only) ###\n"]
        context_parts.append("*Note: These materials show what was taught, not what the student wrote.*\n")
        
        for i, item in enumerate(retrieved_chunks, 1):
            page_info = f"(Page {item['metadata'].get('page', 'N/A')})"
            context_parts.append(f"\n--- Reference {i} {page_info} ---")
            context_parts.append(item['text'])
        
        return "\n".join(context_parts)
    
    def _create_grading_prompt(
        self,
        submission: str,
        rubric: str,
        context: str,
        max_score: float
    ) -> str:
        """
        Create the grading prompt for the LLM.
        
        :param submission: Student submission text
        :param rubric: Rubric text
        :param context: Retrieved context from course materials
        :param max_score: Maximum score
        :return: Formatted prompt
        """
        prompt = f"""Please grade the following student submission according to the provided rubric.

{context}

### RUBRIC (Max Score: {max_score}) ###
{rubric}

### STUDENT SUBMISSION ###
{submission}

### GRADING INSTRUCTIONS ###
1. Evaluate the submission against each criterion in the rubric
2. **ONLY** award points for work that is present in the submission
3. Provide a score out of {max_score}
4. Give specific, constructive feedback
5. If answers are missing or incomplete, state this explicitly

Please format your response as follows:

SCORE: [numerical score out of {max_score}]

OVERALL FEEDBACK:
[General feedback about the submission]

DETAILED FEEDBACK:
[Point-by-point feedback for each rubric criterion]

RUBRIC BREAKDOWN:
- [Criterion 1]: [score]/[max points] - [explanation of what was present/missing]
- [Criterion 2]: [score]/[max points] - [explanation of what was present/missing]
...

RECOMMENDATIONS:
[Specific suggestions for improvement]
"""
        return prompt
    
    def _parse_grading_response(self, response: str, max_score: float) -> GradingResult:
        """
        Parse the LLM response into a GradingResult.
        
        :param response: LLM response text
        :param max_score: Maximum possible score
        :return: Parsed GradingResult
        """
        lines = response.strip().split('\n')
        
        # Extract score
        score = 0.0
        for line in lines:
            if line.strip().startswith('SCORE:'):
                try:
                    score_text = line.split('SCORE:')[1].strip()
                    # Extract first number from the text
                    import re
                    numbers = re.findall(r'\d+\.?\d*', score_text)
                    if numbers:
                        score = float(numbers[0])
                        score = min(score, max_score)  # Cap at max_score
                except (IndexError, ValueError) as e:
                    logger.warning(f"Could not parse score: {e}")
        
        return GradingResult(
            score=score,
            max_score=max_score,
            feedback=response,
        )