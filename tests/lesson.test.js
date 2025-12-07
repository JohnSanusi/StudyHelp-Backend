import request from 'supertest';
// import app from '../app.js'; // Removed static import to allow mocking
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock services
jest.unstable_mockModule('../services/fileProcessor.js', () => ({
    extractTextFromFile: jest.fn().mockResolvedValue('This is a mocked lesson content for testing purposes. It needs to be long enough to pass validation.')
}));

jest.unstable_mockModule('../services/geminiService.js', () => ({
    processLessonContent: jest.fn().mockResolvedValue({
        topics: ['Topic 1', 'Topic 2'],
        summary: 'Mocked summary',
        questions: [{ question: 'Q1', answer: 'A1' }]
    })
}));

// Import app after mocking
const { default: appImport } = await import('../app.js');
const appToUse = appImport;

describe('Lesson Routes', () => {
    let teacherToken;
    let studentToken;

    beforeAll(async () => {
        await connectDB();
        await User.deleteMany({ email: { $in: ['teacher@test.com', 'student@test.com'] } });

        // Create teacher
        const teacherRes = await request(appToUse)
            .post('/api/users/')
            .send({
                name: 'Teacher User',
                email: 'teacher@test.com',
                password: 'password123',
                role: 'teacher',
                whatsappNumber: '1234567890'
            });
        teacherToken = teacherRes.body.token;

        // Create student
        const studentRes = await request(appToUse)
            .post('/api/users/')
            .send({
                name: 'Student User',
                email: 'student@test.com',
                password: 'password123',
                role: 'student',
                whatsappNumber: '0987654321',
                school: 'Test School'
            });
        studentToken = studentRes.body.token;
    });

    afterAll(async () => {
        await User.deleteMany({ email: { $in: ['teacher@test.com', 'student@test.com'] } });
        await mongoose.connection.close();
    });

    describe('POST /api/lessons/upload', () => {
        it('should allow teacher to upload a lesson', async () => {
            // Create a dummy file for testing
            const filePath = path.join(__dirname, 'test-lesson.txt');
            fs.writeFileSync(filePath, 'This is a test lesson content.');

            const res = await request(appToUse)
                .post('/api/lessons/upload')
                .set('Authorization', `Bearer ${teacherToken}`)
                .field('title', 'Test Lesson')
                .field('subject', 'Math')
                .field('topic', 'Algebra')
                .attach('file', filePath);

            // Cleanup dummy file
            fs.unlinkSync(filePath);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('lesson');
            expect(res.body.lesson.title).toBe('Test Lesson');
        });

        it('should deny student from uploading a lesson', async () => {
            const filePath = path.join(__dirname, 'test-lesson-student.txt');
            fs.writeFileSync(filePath, 'Student trying to upload.');

            const res = await request(appToUse)
                .post('/api/lessons/upload')
                .set('Authorization', `Bearer ${studentToken}`)
                .field('title', 'Student Lesson')
                .field('subject', 'Math')
                .field('topic', 'Algebra')
                .attach('file', filePath);

            fs.unlinkSync(filePath);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/lessons', () => {
        it('should return 401 if not authenticated', async () => {
            const res = await request(appToUse).get('/api/lessons');
            expect(res.statusCode).toEqual(401);
        });
    });
});
