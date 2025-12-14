import mongoose from 'mongoose';

const studyNoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    subject: {
        type: String
    },
    tags: [{
        type: String
    }],
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'audio', 'link', 'file']
        },
        url: String,
        name: String
    }],
    
    // AI Analysis fields
    summary: {
        type: String
    },
    keyPoints: [{
        type: String
    }],
    complexity: {
        type: String,
        enum: ['basic', 'intermediate', 'advanced']
    }
}, {
    timestamps: true
});

const StudyNote = mongoose.model('StudyNote', studyNoteSchema);

export default StudyNote;
