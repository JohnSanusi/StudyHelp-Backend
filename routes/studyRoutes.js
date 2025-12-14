import express from 'express';
import { questionController } from '../controllers/questionController.js';
import { flashcardController } from '../controllers/flashcardController.js';
import { noteController } from '../controllers/noteController.js';
import { sessionController } from '../controllers/sessionController.js';
import upload from '../middleware/upload.js';
import { authenticateToken as protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all study routes
router.use(protect);

// Question Generation Routes
router.post('/files/upload', upload.single('file'), questionController.uploadFile);
router.post('/questions/generate', questionController.generateQuestions);
router.get('/questions', questionController.getQuestions);

// Flashcard Routes
router.post('/decks', flashcardController.createDeck);
router.get('/decks', flashcardController.getDecks);
router.get('/decks/:id', flashcardController.getDeck);
router.delete('/decks/:id', flashcardController.deleteDeck);

router.post('/flashcards', flashcardController.createCard);
router.get('/flashcards/deck/:deckId', flashcardController.getCards);
router.post('/flashcards/:id/review', flashcardController.reviewCard);
router.post('/flashcards/generate', flashcardController.generateCardsFromText);

// Note Routes
router.post('/notes', noteController.createNote);
router.get('/notes', noteController.getNotes);
router.get('/notes/:id', noteController.getNote);
router.put('/notes/:id', noteController.updateNote);
router.delete('/notes/:id', noteController.deleteNote);
router.post('/notes/:id/summarize', noteController.summarizeNote);

// Session Routes
router.post('/sessions', sessionController.startSession);
router.put('/sessions/:id', sessionController.updateSession);
router.post('/sessions/:id/end', sessionController.endSession);
router.get('/sessions', sessionController.getSessions);
router.get('/sessions/analytics', sessionController.getAnalytics);

export default router;
