import UploadedFile from '../models/UploadedFile.js';
import GeneratedQuestion from '../models/GeneratedQuestion.js';
import { textExtractionService } from '../services/textExtractionService.js';
import { aiService } from '../services/aiService.js';
import fs from 'fs/promises';

export const questionController = {
    /**
     * Upload a file and extract its text
     */
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const { filename, path, mimetype, size } = req.file;
            const userId = req.user._id;

            // Extract text from the file
            let extractedText = '';
            try {
                extractedText = await textExtractionService.extractText(req.file);
            } catch (error) {
                console.error('Text extraction failed:', error);
                // We still save the file, but mark as not processed or with empty text
            }

            // Create UploadedFile record
            const uploadedFile = await UploadedFile.create({
                user: userId,
                filename,
                fileType: mimetype.split('/')[1] || 'unknown', // simple mapping
                fileUrl: path, // In a real app, this would be a cloud URL
                fileSize: size,
                extractedText,
                processed: !!extractedText
            });

            res.status(201).json({
                message: 'File uploaded and processed successfully',
                file: uploadedFile
            });
        } catch (error) {
            console.error('Upload error:', error);
            // Clean up file if database creation fails
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => {});
            }
            res.status(500).json({ message: 'File upload failed', error: error.message });
        }
    },

    /**
     * Generate questions from an uploaded file or raw text
     */
    async generateQuestions(req, res) {
        try {
            const { fileId, text, options } = req.body;
            const userId = req.user._id;
            let sourceText = text;
            let sourceFileId = null;

            // If fileId is provided, fetch text from the file
            if (fileId) {
                const file = await UploadedFile.findOne({ _id: fileId, user: userId });
                if (!file) {
                    return res.status(404).json({ message: 'File not found' });
                }
                if (!file.extractedText) {
                    return res.status(400).json({ message: 'File has no extracted text' });
                }
                sourceText = file.extractedText;
                sourceFileId = file._id;
            }

            if (!sourceText) {
                return res.status(400).json({ message: 'Text or File ID is required' });
            }

            // Generate questions using AI
            const questionsData = await aiService.generateQuestions(sourceText, options);

            // Save questions to database
            const savedQuestions = await Promise.all(
                questionsData.map(async (q) => {
                    return await GeneratedQuestion.create({
                        user: userId,
                        sourceFile: sourceFileId,
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        difficulty: options?.difficulty || 'medium',
                        subject: options?.subject,
                        tags: options?.tags
                    });
                })
            );

            res.status(201).json({
                message: 'Questions generated successfully',
                count: savedQuestions.length,
                questions: savedQuestions
            });
        } catch (error) {
            console.error('Question generation error:', error);
            res.status(500).json({ message: 'Failed to generate questions', error: error.message });
        }
    },

    /**
     * Get generated questions
     */
    async getQuestions(req, res) {
        try {
            const { fileId, difficulty, limit = 50 } = req.query;
            const userId = req.user._id;

            const query = { user: userId };
            if (fileId) query.sourceFile = fileId;
            if (difficulty) query.difficulty = difficulty;

            const questions = await GeneratedQuestion.find(query)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));

            res.json(questions);
        } catch (error) {
            console.error('Get questions error:', error);
            res.status(500).json({ message: 'Failed to retrieve questions' });
        }
    }
};
