import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher'],
        required: true,
        default: 'student'
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

export default User;
