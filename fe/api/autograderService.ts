import axios from 'axios'; // Import axios directly
import type { IGradingResult } from "~/types/autograder";

// Create a dedicated API client for the FastAPI service
const fastApiClient = axios.create({
  baseURL: 'http://localhost:8000', // Your FastAPI service address
  timeout: 30000, // Increase timeout for file processing
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AutograderRequest {
  courseName: string;
  assignmentDescription: string;
  rubric?: string;
  answerKey?: string;
  studentSubmission: string;
  courseMaterials?: string;
}

class AutograderService {
  async gradeSubmission(request: AutograderRequest): Promise<{ data: IGradingResult }> {
    try {
      // This now calls your FastAPI service directly
      const response = await fastApiClient.post('/api/grade', request);
      return { data: response.data };
    } catch (error) {
      console.error('Autograder service error:', error);
      throw new Error('Failed to grade submission. Please try again.');
    }
  }

  /**
   * Grade a submission with file uploads (PDFs)
   */
  async gradeSubmissionWithFiles(formData: FormData): Promise<{ data: IGradingResult }> {
    try {
      const response = await fastApiClient.post('/api/grade', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { data: response.data };
    } catch (error) {
      console.error('Autograder service file upload error:', error);
      throw new Error('Failed to grade submission with files. Please try again.');
    }
  }

  /**
   * Check if the Python autograder service is healthy
   */
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fastApiClient.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Autograder health check failed:', error);
      throw new Error('Autograder service is unavailable');
    }
  }
}

export default new AutograderService();