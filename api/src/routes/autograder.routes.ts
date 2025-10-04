import express from "express";
import { AutograderController } from "../controllers/autograder.controller.js";

// Configure multer for file uploads
const multer = require('multer');
import type { FileFilterCallback } from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory for forwarding
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Accept PDF files only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed') as any, false);
    }
  }
});

const router = express.Router();

// Handle multiple file uploads with the same field names as your frontend
const uploadFields = upload.fields([
  { name: 'assignmentDescriptionFile', maxCount: 1 },
  { name: 'rubricFile', maxCount: 1 },
  { name: 'answerKeyFile', maxCount: 1 },
  { name: 'studentSubmissionFile', maxCount: 1 }
]);

router.post("/grade", uploadFields, AutograderController.gradeSubmission);
router.get("/health", AutograderController.healthCheck);

export default router;