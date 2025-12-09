import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const JWT_SECRET = config.JWT_SECRET;

// Handle successful OAuth authentication
export const handleOAuthSuccess = (req, res) => {
    try {
        // User is attached to req.user by Passport
        const user = req.user;

        if (!user) {
            return res.redirect(`${config.FRONTEND_URL}/login?error=authentication_failed`);
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                role: user.role 
            }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // Prepare user response (without sensitive data)
        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            whatsappNumber: user.whatsappNumber,
            school: user.school,
            authProvider: user.authProvider,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        // Redirect to frontend with token and user data
        // In production, you might want to use a more secure method
        const redirectUrl = `${config.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}`;
        
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Error in handleOAuthSuccess:', error);
        res.redirect(`${config.FRONTEND_URL}/login?error=server_error`);
    }
};

// Handle OAuth authentication failure
export const handleOAuthFailure = (req, res) => {
    console.error('OAuth authentication failed');
    res.redirect(`${config.FRONTEND_URL}/login?error=oauth_failed`);
};
