import express from 'express';
import {
    uploadLesson,
    getLessons,
    getLesson,
    deleteLesson
} from '../controllers/lessonController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { isTeacher } from '../middleware/roleMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Teacher only routes
router.post('/upload', isTeacher, upload.single('file'), uploadLesson);
router.get('/', isTeacher, getLessons);
router.get('/:id', isTeacher, getLesson);
router.delete('/:id', isTeacher, deleteLesson);

export default router;
