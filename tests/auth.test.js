import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';

describe('Auth Routes', () => {
    beforeAll(async () => {
        await connectDB();
        // Connect to a test database or clear the existing one
        // For simplicity, we'll assume the main DB connection works for now
        // In a real scenario, use a separate test DB
        await User.deleteMany({ email: { $in: ['test@example.com', 'login@example.com'] } });
    });

    afterAll(async () => {
        await User.deleteMany({ email: { $in: ['test@example.com', 'login@example.com'] } });
        await mongoose.connection.close();
    });

    describe('POST /api/users/signup', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/api/users/')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'student',
                    whatsappNumber: '1234567890',
                    school: 'Test School'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
        });
    });

    describe('POST /api/users/login', () => {
        it('should login an existing user', async () => {
            // Create user first
            await request(app)
                .post('/api/users/')
                .send({
                    name: 'Login User',
                    email: 'login@example.com',
                    password: 'password123',
                    role: 'student',
                    whatsappNumber: '0987654321',
                    school: 'Test School'
                });

            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
        });
    });
});
