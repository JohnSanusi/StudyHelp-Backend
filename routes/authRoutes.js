import express from 'express';
import passport from '../config/passport.js';
import { handleOAuthSuccess, handleOAuthFailure } from '../controllers/oauthController.js';

const router = express.Router();

// Google OAuth Routes
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/api/auth/failure',
        session: false // We're using JWT, not sessions for auth
    }),
    handleOAuthSuccess
);

// Failure route
router.get('/failure', handleOAuthFailure);

export default router;
