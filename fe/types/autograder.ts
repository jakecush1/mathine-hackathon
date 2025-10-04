export interface IGradingResult {
  estimatedGrade: number;
  feedback: string;
  improvementSuggestions: string[];
  confidenceScore?: number;
  gradedAreas?: {
    area: string;
    score: number;
    feedback: string;
  }[];
}

export interface IGradingHistory {
  id: string;
  courseName: string;
  assignmentDescription: string;
  estimatedGrade: number;
  timestamp: Date;
  fullResults: IGradingResult;
}