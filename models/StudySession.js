import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    topic: {
        type: String
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // In minutes
        default: 0
    },
    sessionType: {
        type: String,
        enum: ['pomodoro', 'deep_work', 'review', 'practice'],
        default: 'pomodoro'
    },
    
    // Pomodoro specific
    pomodoroCycles: {
        type: Number,
        default: 0
    },
    
    focusScore: {
        type: Number, // 0-100
        min: 0,
        max: 100
    },
    completed: {
        type: Boolean,
        default: false
    },
    goals: [{
        type: String
    }],
    notesCreated: {
        type: Number,
        default: 0
    }
});

const StudySession = mongoose.model('StudySession', studySessionSchema);

export default StudySession;
