import apiClient from './apiClient';
import type { IGradingResult } from "~/types/autograder";

interface AutograderRequest {
  courseName: string;
  assignmentDescription: string;
  rubric?: string;
  answerKey?: string;
  studentSubmission: string;
  courseMaterials?: string;
  max_score?: number;
}

class AutograderService {
  /**
   * Grade a submission with text-only content
   */
  async gradeSubmission(request: AutograderRequest): Promise<{ data: IGradingResult }> {
    try {
      const response = await apiClient.post('/autograder/grade', request);
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
      const response = await apiClient.post('/autograder/grade', formData, {
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
      const response = await apiClient.get('/autograder/health');
      return response.data;
    } catch (error) {
      console.error('Autograder health check failed:', error);
      throw new Error('Autograder service is unavailable');
    }
  }
}

export default new AutograderService();