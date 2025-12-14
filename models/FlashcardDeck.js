import mongoose from 'mongoose';

const flashcardDeckSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
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
    lastStudied: {
        type: Date
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for card count
flashcardDeckSchema.virtual('cardCount', {
    ref: 'Flashcard',
    localField: '_id',
    foreignField: 'deck',
    count: true
});

const FlashcardDeck = mongoose.model('FlashcardDeck', flashcardDeckSchema);

export default FlashcardDeck;
