from fastapi import FastAPI, File, UploadFile, Form
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from typing import List, Optional
import io

from config import AutograderConfig
from pdf_processor import PDFProcessor
from grader import Autograder
from pdf_processor import Document

app = FastAPI(title="Autograder RAG Service")

# CORS for Express backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002","http://localhost:3000"],  # Express backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances (initialize once)
config = None
pdf_processor = None
autograder = None

@app.on_event("startup")
async def startup_event():
    global config, pdf_processor, autograder
    config = AutograderConfig.from_env()
    pdf_processor = PDFProcessor(
        chunk_size=config.chunk_size,
        chunk_overlap=config.chunk_overlap
    )
    autograder = Autograder(config)

@app.post("/api/grade")
async def grade_submission(
    courseName: str = Form(...),
    assignmentDescription: str = Form(""),
    rubric: str = Form(""),
    answerKey: str = Form(""),
    studentSubmission: str = Form(""),
    courseMaterials: str = Form(""),
    assignmentDescriptionFile: Optional[UploadFile] = File(None),
    rubricFile: Optional[UploadFile] = File(None),
    answerKeyFile: Optional[UploadFile] = File(None),
    studentSubmissionFile: Optional[UploadFile] = File(None),
    max_score: float = Form(100.0)
):
    try:
        # Process uploaded files if they exist
        documents_to_process = []
        
        if assignmentDescriptionFile:
            assignment_doc = pdf_processor.load_pdf(file_bytes=io.BytesIO(await assignmentDescriptionFile.read()))
            documents_to_process.append(assignment_doc)
        
        if rubricFile:
            rubric_doc = pdf_processor.load_pdf(file_bytes=io.BytesIO(await rubricFile.read()))
            documents_to_process.append(rubric_doc)
        
        # Add documents to knowledge base
        if documents_to_process:
            autograder.add_course_materials(documents_to_process)
        
        # Process submission file or use text
        if studentSubmissionFile:
            submission_doc = pdf_processor.load_pdf(file_bytes=io.BytesIO(await studentSubmissionFile.read()))
        else:
            submission_doc = Document(text=studentSubmission, source="text_submission")
        
        # Process rubric file or use text  
        if rubricFile:
            rubric_doc = pdf_processor.load_pdf(file_bytes=io.BytesIO(await rubricFile.read()))
        else:
            rubric_doc = Document(text=rubric, source="text_rubric")
        
        # Grade the submission
        result = autograder.grade_submission(
            submission=submission_doc,
            rubric=rubric_doc,
            max_score=max_score
        )
        
        return {
            "score": result.score,
            "max_score": result.max_score,
            "feedback": result.feedback,
            "estimatedGrade": result.score  # For frontend compatibility
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grading failed: {str(e)}")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "autograder-rag"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)