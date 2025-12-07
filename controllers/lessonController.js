import Lesson from '../models/Lesson.js';
import { extractTextFromFile } from '../services/fileProcessor.js';
import { processLessonContent } from '../services/geminiService.js';
import fs from 'fs';

// Upload and process lesson
export const uploadLesson = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title } = req.body;
        if (!title) {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Title is required' });
        }

        // 1. Extract text from file
        let content;
        try {
            content = await extractTextFromFile(req.file);
        } catch (error) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Failed to extract text from file' });
        }

        if (!content || content.length < 50) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'File content is too short or empty' });
        }

        // 2. Process content with AI
        const aiResults = await processLessonContent(content);

        // 3. Save to database
        const lesson = await Lesson.create({
            title,
            content,
            fileUrl: req.file.path,
            fileType: req.file.mimetype,
            topics: aiResults.topics,
            summary: aiResults.summary,
            questions: aiResults.questions,
            teacherId: req.user.userId
        });

        res.status(201).json({
            message: 'Lesson uploaded and processed successfully',
            lesson
        });

    } catch (error) {
        console.error('Error uploading lesson:', error);
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all lessons for the logged-in teacher
export const getLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find({ teacherId: req.user.userId })
            .select('-content') // Exclude large content field
            .sort({ createdAt: -1 });

        res.status(200).json({ lessons });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single lesson details
export const getLesson = async (req, res) => {
    try {
        const { id } = req.params;

        const lesson = await Lesson.findOne({
            _id: id,
            teacherId: req.user.userId
        });

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        res.status(200).json({ lesson });
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete lesson
export const deleteLesson = async (req, res) => {
    try {
        const { id } = req.params;

        const lesson = await Lesson.findOneAndDelete({
            _id: id,
            teacherId: req.user.userId
        });

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        // Delete file from filesystem
        if (lesson.fileUrl && fs.existsSync(lesson.fileUrl)) {
            fs.unlinkSync(lesson.fileUrl);
        }

        res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
