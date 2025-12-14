import FlashcardDeck from '../models/FlashcardDeck.js';
import Flashcard from '../models/Flashcard.js';
import { aiService } from '../services/aiService.js';

// Spaced Repetition Algorithm (SM-2)
const calculateNextReview = (quality, previousInterval, previousEaseFactor) => {
    if (quality < 3) {
        return { interval: 1, easeFactor: previousEaseFactor };
    }

    let easeFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);

    let interval;
    if (previousInterval === 1) {
        interval = 6;
    } else {
        interval = Math.round(previousInterval * easeFactor);
    }

    return { interval, easeFactor };
};

export const flashcardController = {
    // --- Deck Operations ---

    async createDeck(req, res) {
        try {
            const { name, description, subject, tags } = req.body;
            const userId = req.user._id;

            const deck = await FlashcardDeck.create({
                user: userId,
                name,
                description,
                subject,
                tags
            });

            res.status(201).json(deck);
        } catch (error) {
            res.status(500).json({ message: 'Failed to create deck', error: error.message });
        }
    },

    async getDecks(req, res) {
        try {
            const userId = req.user._id;
            const decks = await FlashcardDeck.find({ user: userId })
                .populate('cardCount')
                .sort({ lastStudied: -1, createdAt: -1 });
            res.json(decks);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve decks', error: error.message });
        }
    },

    async getDeck(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const deck = await FlashcardDeck.findOne({ _id: id, user: userId }).populate('cardCount');
            
            if (!deck) {
                return res.status(404).json({ message: 'Deck not found' });
            }
            res.json(deck);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve deck', error: error.message });
        }
    },

    async deleteDeck(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            
            const deck = await FlashcardDeck.findOneAndDelete({ _id: id, user: userId });
            if (!deck) {
                return res.status(404).json({ message: 'Deck not found' });
            }

            // Delete associated cards
            await Flashcard.deleteMany({ deck: id });

            res.json({ message: 'Deck deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete deck', error: error.message });
        }
    },

    // --- Flashcard Operations ---

    async createCard(req, res) {
        try {
            const { deckId, front, back, tags } = req.body;
            const userId = req.user._id;

            // Verify deck ownership
            const deck = await FlashcardDeck.findOne({ _id: deckId, user: userId });
            if (!deck) {
                return res.status(404).json({ message: 'Deck not found' });
            }

            const card = await Flashcard.create({
                user: userId,
                deck: deckId,
                front,
                back,
                tags
            });

            res.status(201).json(card);
        } catch (error) {
            res.status(500).json({ message: 'Failed to create card', error: error.message });
        }
    },

    async getCards(req, res) {
        try {
            const { deckId } = req.params;
            const userId = req.user._id;
            
            const cards = await Flashcard.find({ deck: deckId, user: userId });
            res.json(cards);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve cards', error: error.message });
        }
    },

    async reviewCard(req, res) {
        try {
            const { id } = req.params;
            const { quality } = req.body; // 0-5
            const userId = req.user._id;

            if (quality < 0 || quality > 5) {
                return res.status(400).json({ message: 'Quality must be between 0 and 5' });
            }

            const card = await Flashcard.findOne({ _id: id, user: userId });
            if (!card) {
                return res.status(404).json({ message: 'Card not found' });
            }

            // Calculate new SRS values
            const { interval, easeFactor } = calculateNextReview(
                quality,
                card.interval,
                card.easeFactor
            );

            // Update card
            card.interval = interval;
            card.easeFactor = easeFactor;
            card.repetitions += 1;
            card.lastReviewed = new Date();
            card.lastReviewQuality = quality;
            
            // Calculate next review date
            const nextReview = new Date();
            nextReview.setDate(nextReview.getDate() + interval);
            card.nextReview = nextReview;

            // Update performance metrics
            card.totalReviews += 1;
            if (quality >= 3) {
                card.correctReviews += 1;
                card.streak += 1;
            } else {
                card.streak = 0;
            }

            await card.save();

            // Update deck last studied
            await FlashcardDeck.findByIdAndUpdate(card.deck, { lastStudied: new Date() });

            res.json(card);
        } catch (error) {
            res.status(500).json({ message: 'Failed to review card', error: error.message });
        }
    },

    async generateCardsFromText(req, res) {
        try {
            const { text, deckId, count } = req.body;
            const userId = req.user._id;

            // Verify deck ownership
            const deck = await FlashcardDeck.findOne({ _id: deckId, user: userId });
            if (!deck) {
                return res.status(404).json({ message: 'Deck not found' });
            }

            const cardsData = await aiService.generateFlashcards(text, count);

            const savedCards = await Promise.all(
                cardsData.map(async (c) => {
                    return await Flashcard.create({
                        user: userId,
                        deck: deckId,
                        front: c.front,
                        back: c.back,
                        tags: c.tags
                    });
                })
            );

            res.status(201).json({
                message: 'Flashcards generated successfully',
                count: savedCards.length,
                cards: savedCards
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to generate flashcards', error: error.message });
        }
    }
};
