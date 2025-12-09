import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';

describe('OAuth User Creation', () => {
    beforeAll(async () => {
        await connectDB();
        await User.deleteMany({ 
            email: { $in: ['oauth-google@example.com', 'oauth-minimal@example.com'] } 
        });
    });

    afterAll(async () => {
        await User.deleteMany({ 
            email: { $in: ['oauth-google@example.com', 'oauth-minimal@example.com'] } 
        });
        await mongoose.connection.close();
    });

    describe('OAuth User Registration', () => {
        it('should create a user with Google OAuth provider', async () => {
            const user = await User.create({
                email: 'oauth-google@example.com',
                name: 'Google User',
                role: 'student',
                authProvider: 'google',
                providerId: 'google-123456',
                profilePicture: 'https://example.com/photo.jpg'
            });

            expect(user).toBeDefined();
            expect(user.email).toBe('oauth-google@example.com');
            expect(user.authProvider).toBe('google');
            expect(user.providerId).toBe('google-123456');
            expect(user.password).toBeUndefined();
        });

        it('should allow OAuth user without whatsappNumber and school', async () => {
            const user = await User.create({
                email: 'oauth-minimal@example.com',
                name: 'Minimal OAuth User',
                role: 'student',
                authProvider: 'google',
                providerId: 'google-minimal-123'
            });

            expect(user).toBeDefined();
            expect(user.whatsappNumber).toBeUndefined();
            expect(user.school).toBeUndefined();
        });
    });

    describe('Duplicate Email Handling', () => {
        it('should enforce unique email constraint', async () => {
            // Create first user
            await User.create({
                email: 'duplicate@example.com',
                name: 'First User',
                role: 'student',
                authProvider: 'local',
                password: 'hashedpassword123'
            });

            // Try to create second user with same email
            await expect(
                User.create({
                    email: 'duplicate@example.com',
                    name: 'Second User',
                    role: 'student',
                    authProvider: 'google',
                    providerId: 'google-duplicate-123'
                })
            ).rejects.toThrow();

            // Cleanup
            await User.deleteOne({ email: 'duplicate@example.com' });
        });
    });

    describe('Provider + ProviderId Uniqueness', () => {
        it('should enforce unique providerId per provider', async () => {
            const googleUser1 = await User.create({
                email: 'user1@example.com',
                name: 'User 1',
                role: 'student',
                authProvider: 'google',
                providerId: '123456'
            });

            // Try to create another Google user with same providerId
            await expect(
                User.create({
                    email: 'user2@example.com',
                    name: 'User 2',
                    role: 'student',
                    authProvider: 'google',
                    providerId: '123456' // Same ID, same provider - should fail
                })
            ).rejects.toThrow();

            // Cleanup
            await User.deleteMany({ 
                email: { $in: ['user1@example.com', 'user2@example.com'] } 
            });
        });
    });
});
