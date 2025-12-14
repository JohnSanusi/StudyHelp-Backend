import StudyNote from '../models/StudyNote.js';
import { aiService } from '../services/aiService.js';

export const noteController = {
    async createNote(req, res) {
        try {
            const { title, content, subject, tags, attachments } = req.body;
            const userId = req.user._id;

            const note = await StudyNote.create({
                user: userId,
                title,
                content,
                subject,
                tags,
                attachments
            });

            res.status(201).json(note);
        } catch (error) {
            res.status(500).json({ message: 'Failed to create note', error: error.message });
        }
    },

    async getNotes(req, res) {
        try {
            const userId = req.user._id;
            const { subject, tag, search } = req.query;

            const query = { user: userId };
            if (subject) query.subject = subject;
            if (tag) query.tags = tag;
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } }
                ];
            }

            const notes = await StudyNote.find(query).sort({ updatedAt: -1 });
            res.json(notes);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve notes', error: error.message });
        }
    },

    async getNote(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const note = await StudyNote.findOne({ _id: id, user: userId });
            if (!note) {
                return res.status(404).json({ message: 'Note not found' });
            }

            res.json(note);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve note', error: error.message });
        }
    },

    async updateNote(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const userId = req.user._id;

            const note = await StudyNote.findOneAndUpdate(
                { _id: id, user: userId },
                updates,
                { new: true, runValidators: true }
            );

            if (!note) {
                return res.status(404).json({ message: 'Note not found' });
            }

            res.json(note);
        } catch (error) {
            res.status(500).json({ message: 'Failed to update note', error: error.message });
        }
    },

    async deleteNote(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const note = await StudyNote.findOneAndDelete({ _id: id, user: userId });
            if (!note) {
                return res.status(404).json({ message: 'Note not found' });
            }

            res.json({ message: 'Note deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete note', error: error.message });
        }
    },

    async summarizeNote(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const note = await StudyNote.findOne({ _id: id, user: userId });
            if (!note) {
                return res.status(404).json({ message: 'Note not found' });
            }

            if (!note.content) {
                return res.status(400).json({ message: 'Note has no content to summarize' });
            }

            const summaryData = await aiService.summarizeText(note.content);

            // Update note with analysis
            note.summary = summaryData.summary;
            note.keyPoints = summaryData.keyPoints;
            note.complexity = summaryData.complexity;
            
            // Add suggested tags if they don't exist
            if (summaryData.tags) {
                const newTags = summaryData.tags.filter(tag => !note.tags.includes(tag));
                note.tags.push(...newTags);
            }

            await note.save();

            res.json({
                message: 'Note summarized successfully',
                summary: note.summary,
                keyPoints: note.keyPoints,
                complexity: note.complexity,
                tags: note.tags
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to summarize note', error: error.message });
        }
    }
};
