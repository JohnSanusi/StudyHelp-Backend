import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deck: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FlashcardDeck',
        required: true
    },
    front: {
        type: String,
        required: true
    },
    back: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    // Spaced Repetition System (SRS) fields
    interval: {
        type: Number, // Days until next review
        default: 1
    },
    easeFactor: {
        type: Number,
        default: 2.5
    },
    repetitions: {
        type: Number,
        default: 0
    },
    nextReview: {
        type: Date,
        default: Date.now
    },
    lastReviewed: {
        type: Date
    },
    
    // Performance metrics
    totalReviews: {
        type: Number,
        default: 0
    },
    correctReviews: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    lastReviewQuality: {
        type: Number, // 0-5 scale
        min: 0,
        max: 5
    }
});

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

export default Flashcard;
