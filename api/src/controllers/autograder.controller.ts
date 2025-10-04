import { Request, Response, NextFunction } from "express";
const fetch = require('node-fetch');
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

export class AutograderController {
  static async validateNetlink(netlink: string | undefined) {
    if (!netlink) throw new Error("Not authenticated. Netlink is required.");
  }

  static async gradeSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      // Optional: Add authentication if needed
      // await this.validateNetlink(process.env.netID);

      const { 
        courseName, 
        assignmentDescription, 
        rubric, 
        answerKey, 
        studentSubmission, 
        courseMaterials,
        max_score = 100.0 
      } = req.body;

      // Create form data for Python service
      const formData = new FormData();
      
      // Append text fields
      formData.append('courseName', courseName);
      formData.append('assignmentDescription', assignmentDescription || '');
      formData.append('rubric', rubric || '');
      formData.append('answerKey', answerKey || '');
      formData.append('studentSubmission', studentSubmission || '');
      formData.append('courseMaterials', courseMaterials || '');
      formData.append('max_score', max_score.toString());

      // Handle file uploads if they exist
      if (
        req.files &&
        typeof req.files === 'object' &&
        !Array.isArray(req.files)
      ) {
        const fileFields = [
          'assignmentDescriptionFile',
          'rubricFile', 
          'answerKeyFile',
          'studentSubmissionFile'
        ];

        fileFields.forEach(fieldName => {
          const filesObj = req.files as { [fieldname: string]: Express.Multer.File | Express.Multer.File[] };
          const file = filesObj[fieldName];
          if (file) {
            // Handle both single and array file uploads
            const fileToUse = Array.isArray(file) ? file[0] : file;
            formData.append(fieldName, fileToUse.buffer ,{
              filename: fileToUse.originalname,
              contentType: fileToUse.mimetype
            });
          }
        });
      }

      // Forward to Python FastAPI service
      const pythonApiResponse = await fetch('http://localhost:8000/api/grade', {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      });

      if (!pythonApiResponse.ok) {
        throw new Error(`Python service error: ${pythonApiResponse.statusText}`);
      }

      const result = await pythonApiResponse.json();
      res.json(result);

    } catch (error) {
      console.error('Error in AutograderController:', error);
      next(error);
    }
  }

  // Optional: Health check for Python service
  static async healthCheck(req: Request, res: Response, next: NextFunction) {
    console.log('Health check requested');
    try {
      const healthResponse = await fetch('http://localhost:8000/health');
      const healthStatus = await healthResponse.json();
      res.json(healthStatus);
    } catch (error) {
      next(error);
    }
  }
}