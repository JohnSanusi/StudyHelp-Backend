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
    },
    whatsappNumber: {
        type: String,
        required: true,
        trim: true
    },
    school: {
        type: String,
        trim: true,
        // Only required for students
        required: function () {
            return this.role === 'student';
        }
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

export default User;
