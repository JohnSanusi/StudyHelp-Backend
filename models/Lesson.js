import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    topics: [{
        type: String
    }],
    summary: {
        type: String
    },
    questions: [{
        question: String,
        options: [String],
        correctAnswer: String,
        explanation: String
    }],
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
