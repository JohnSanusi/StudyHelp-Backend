import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

// Create reusable transporter
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    }
});

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: config.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request - StudyHub',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p>${resetUrl}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};
