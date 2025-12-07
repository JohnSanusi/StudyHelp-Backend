import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const JWT_SECRET = config.JWT_SECRET;

// Create a new user (Register)
export const createUser = async (req, res) => {
    try {
        const { email, password, name, role, whatsappNumber, school } = req.body;

        // Validate input
        if (!email || !password || !role || !whatsappNumber) {
            return res.status(400).json({ error: 'Email, password, role, and whatsapp number are required' });
        }

        // Validate role
        if (!['student', 'teacher'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be either student or teacher' });
        }

        // Validate school for students
        if (role === 'student' && !school) {
            return res.status(400).json({ error: 'School is required for students' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user data
        const userData = {
            email,
            password: hashedPassword,
            name,
            role,
            whatsappNumber
        };

        // Add school only for students
        if (role === 'student') {
            userData.school = school;
        }

        // Create user
        const user = await User.create(userData);

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
            expiresIn: '24h'
        });

        // Return user without password
        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            whatsappNumber: user.whatsappNumber,
            school: user.school,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(201).json({ user: userResponse, token });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
            expiresIn: '24h'
        });

        // Return user without password
        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            whatsappNumber: user.whatsappNumber,
            school: user.school,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json({ user: userResponse, token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');

        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, password, role } = req.body;

        // Build update data
        const updateData = {};
        if (email) updateData.email = email;
        if (name) updateData.name = name;
        if (role) {
            if (!['student', 'teacher'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role. Must be either student or teacher' });
            }
            updateData.role = role;
        }
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
