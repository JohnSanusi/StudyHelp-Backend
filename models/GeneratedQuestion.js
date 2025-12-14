import mongoose from 'mongoose';

const generatedQuestionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sourceFile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UploadedFile'
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number, // Index of the correct option
        required: true
    },
    explanation: {
        type: String
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    subject: {
        type: String
    },
    tags: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Performance tracking
    attempts: {
        type: Number,
        default: 0
    },
    correctAttempts: {
        type: Number,
        default: 0
    }
});

const GeneratedQuestion = mongoose.model('GeneratedQuestion', generatedQuestionSchema);

export default GeneratedQuestion;
