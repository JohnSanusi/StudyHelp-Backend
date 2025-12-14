import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';

// Set environment variables for testing
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

// Mock AI Service
jest.unstable_mockModule('../services/aiService.js', () => ({
    aiService: {
        generateQuestions: jest.fn().mockResolvedValue([
            {
                question: 'Test Question?',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 0,
                explanation: 'Test Explanation'
            }
        ]),
        summarizeText: jest.fn().mockResolvedValue({
            summary: 'Test Summary',
            keyPoints: ['Point 1', 'Point 2'],
            complexity: 'basic',
            tags: ['Tag1']
        }),
        generateFlashcards: jest.fn().mockResolvedValue([
            {
                front: 'Front',
                back: 'Back',
                tags: ['Tag1']
            }
        ])
    }
}));

// Mock Auth Middleware
jest.unstable_mockModule('../middleware/authMiddleware.js', () => ({
    authenticateToken: (req, res, next) => {
        // Mock user attached to request
        req.user = { _id: '507f1f77bcf86cd799439011' }; 
        next();
    },
    protect: (req, res, next) => {
        req.user = { _id: '507f1f77bcf86cd799439011' };
        next();
    }
}));

// Mock Text Extraction Service
jest.unstable_mockModule('../services/textExtractionService.js', () => ({
    textExtractionService: {
        extractText: jest.fn().mockResolvedValue('Extracted text content')
    }
}));

// Import app after mocking
const { app } = await import('../server.js');
const { default: User } = await import('../models/User.js');
const { default: UploadedFile } = await import('../models/UploadedFile.js');
const { default: GeneratedQuestion } = await import('../models/GeneratedQuestion.js');
const { default: FlashcardDeck } = await import('../models/FlashcardDeck.js');
const { default: Flashcard } = await import('../models/Flashcard.js');
const { default: StudyNote } = await import('../models/StudyNote.js');
const { default: StudySession } = await import('../models/StudySession.js');

let token;
const userId = '507f1f77bcf86cd799439011'; // Fixed ID matching mock

beforeAll(async () => {
    // Wait for DB connection
    if (mongoose.connection.readyState !== 1) {
        await new Promise(resolve => {
            mongoose.connection.once('open', resolve);
        });
    }
    
    // Create test user with specific ID
    // We don't strictly need to create the user in DB if we mock auth, 
    // but we might need it for foreign key checks if any.
    // However, the controllers usually just    // Create test user (optional, but good practice)
    /*
    const user = await User.create({
        _id: userId,
        name: 'Study User',
        email: 'study@example.com',
        password: 'password123',
        authProvider: 'local'
    });
    */
});

afterAll(async () => {
    await User.deleteMany({});
    await UploadedFile.deleteMany({});
    await GeneratedQuestion.deleteMany({});
    await FlashcardDeck.deleteMany({});
    await Flashcard.deleteMany({});
    await StudyNote.deleteMany({});
    await StudySession.deleteMany({});
    await mongoose.connection.close();
});

describe('Study Page Features', () => {
    
    describe('Question Generator', () => {
        it('should generate questions from text', async () => {
            const res = await request(app)
                .post('/api/study/questions/generate')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    text: 'Sample text content',
                    options: { difficulty: 'easy' }
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.count).toBe(1);
            expect(res.body.questions[0].question).toBe('Test Question?');
        });

        it('should get generated questions', async () => {
            const res = await request(app)
                .get('/api/study/questions')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('Flashcard System', () => {
        let deckId;
        let cardId;

        it('should create a deck', async () => {
            const res = await request(app)
                .post('/api/study/decks')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Test Deck',
                    subject: 'Testing'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.name).toBe('Test Deck');
            deckId = res.body._id;
        });

        it('should create a flashcard', async () => {
            const res = await request(app)
                .post('/api/study/flashcards')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    deckId,
                    front: 'Test Front',
                    back: 'Test Back'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.front).toBe('Test Front');
            cardId = res.body._id;
        });

        it('should review a flashcard', async () => {
            const res = await request(app)
                .post(`/api/study/flashcards/${cardId}/review`)
                .set('Authorization', `Bearer ${token}`)
                .send({ quality: 5 });

            expect(res.statusCode).toBe(200);
            expect(res.body.repetitions).toBe(1);
            expect(res.body.interval).toBeGreaterThan(1);
        });
    });

    describe('Smart Notes', () => {
        let noteId;

        it('should create a note', async () => {
            const res = await request(app)
                .post('/api/study/notes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Test Note',
                    content: 'This is a test note content.'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.title).toBe('Test Note');
            noteId = res.body._id;
        });

        it('should summarize a note', async () => {
            const res = await request(app)
                .post(`/api/study/notes/${noteId}/summarize`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.summary).toBe('Test Summary');
            expect(res.body.keyPoints).toHaveLength(2);
        });
    });

    describe('Study Timer', () => {
        let sessionId;

        it('should start a session', async () => {
            const res = await request(app)
                .post('/api/study/sessions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    subject: 'Math',
                    sessionType: 'pomodoro'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.subject).toBe('Math');
            sessionId = res.body._id;
        });

        it('should end a session', async () => {
            const res = await request(app)
                .post(`/api/study/sessions/${sessionId}/end`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    focusScore: 85
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.completed).toBe(true);
            expect(res.body.focusScore).toBe(85);
        });

        it('should get analytics', async () => {
            const res = await request(app)
                .get('/api/study/sessions/analytics')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.totalSessions).toBeGreaterThan(0);
        });
    });

});
