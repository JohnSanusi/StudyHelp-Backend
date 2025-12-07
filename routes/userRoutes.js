import express from 'express';
import {
    createUser,
    loginUser,
    getUsers,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
import { forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', createUser);           // Register
router.post('/login', loginUser);       // Login
router.post('/forgot-password', forgotPassword);  // Forgot password
router.post('/reset-password', resetPassword);    // Reset password

// Protected routes
router.get('/', authenticateToken, getUsers);           // Get all users
router.put('/:id', authenticateToken, updateUser);      // Update user
router.delete('/:id', authenticateToken, deleteUser);   // Delete user

export default router;
