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
        required: function() {
            // Password is only required for local authentication
            return this.authProvider === 'local';
        }
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
        required: false, // Optional for OAuth users initially
        trim: true
    },
    school: {
        type: String,
        trim: true,
        required: false // Optional for OAuth users initially
    },
    // OAuth fields
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
        required: true
    },
    providerId: {
        type: String,
        // Unique per provider
        sparse: true
    },
    profilePicture: {
        type: String // URL to profile picture from OAuth provider
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

// Partial unique index: ensure unique provider + providerId combinations
// Only for OAuth users (where providerId is not null)
userSchema.index(
    { authProvider: 1, providerId: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { providerId: { $type: 'string' } }
    }
);

const User = mongoose.model('User', userSchema);

export default User;

