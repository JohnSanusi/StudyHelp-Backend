import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import bcrypt from 'bcrypt';

// Forgot Password - Send reset email
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token before saving to database
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token and expiry to user
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email with unhashed token
        const emailResult = await sendPasswordResetEmail(email, resetToken);

        if (!emailResult.success) {
            return res.status(500).json({ error: 'Error sending email. Please try again later.' });
        }

        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reset Password - Verify token and update password
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Hash the token from URL to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token and not expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
