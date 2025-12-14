import StudySession from '../models/StudySession.js';

export const sessionController = {
    async startSession(req, res) {
        try {
            const { subject, topic, sessionType, goals } = req.body;
            const userId = req.user._id;

            const session = await StudySession.create({
                user: userId,
                subject,
                topic,
                sessionType,
                goals,
                startTime: new Date()
            });

            res.status(201).json(session);
        } catch (error) {
            res.status(500).json({ message: 'Failed to start session', error: error.message });
        }
    },

    async updateSession(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const userId = req.user._id;

            const session = await StudySession.findOneAndUpdate(
                { _id: id, user: userId },
                updates,
                { new: true }
            );

            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }

            res.json(session);
        } catch (error) {
            res.status(500).json({ message: 'Failed to update session', error: error.message });
        }
    },

    async endSession(req, res) {
        try {
            const { id } = req.params;
            const { focusScore, notesCreated, pomodoroCycles } = req.body;
            const userId = req.user._id;

            const session = await StudySession.findOne({ _id: id, user: userId });
            if (!session) {
                return res.status(404).json({ message: 'Session not found' });
            }

            const endTime = new Date();
            const duration = Math.round((endTime - session.startTime) / 1000 / 60); // Duration in minutes

            session.endTime = endTime;
            session.duration = duration;
            session.completed = true;
            if (focusScore !== undefined) session.focusScore = focusScore;
            if (notesCreated !== undefined) session.notesCreated = notesCreated;
            if (pomodoroCycles !== undefined) session.pomodoroCycles = pomodoroCycles;

            await session.save();

            res.json(session);
        } catch (error) {
            res.status(500).json({ message: 'Failed to end session', error: error.message });
        }
    },

    async getSessions(req, res) {
        try {
            const userId = req.user._id;
            const { limit = 10 } = req.query;

            const sessions = await StudySession.find({ user: userId })
                .sort({ startTime: -1 })
                .limit(parseInt(limit));

            res.json(sessions);
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve sessions', error: error.message });
        }
    },

    async getAnalytics(req, res) {
        try {
            const userId = req.user._id;
            const { period = 'weekly' } = req.query; // daily, weekly, monthly

            const now = new Date();
            let startDate = new Date();

            if (period === 'daily') {
                startDate.setDate(now.getDate() - 7); // Last 7 days
            } else if (period === 'weekly') {
                startDate.setDate(now.getDate() - 30); // Last 30 days
            } else if (period === 'monthly') {
                startDate.setMonth(now.getMonth() - 6); // Last 6 months
            }

            const sessions = await StudySession.find({
                user: userId,
                startTime: { $gte: startDate },
                completed: true
            });

            // Calculate metrics
            const totalStudyTime = sessions.reduce((acc, curr) => acc + curr.duration, 0);
            const totalSessions = sessions.length;
            const averageFocusScore = sessions.length > 0
                ? sessions.reduce((acc, curr) => acc + (curr.focusScore || 0), 0) / sessions.length
                : 0;

            // Group by subject
            const subjectDistribution = sessions.reduce((acc, curr) => {
                acc[curr.subject] = (acc[curr.subject] || 0) + curr.duration;
                return acc;
            }, {});

            res.json({
                period,
                totalStudyTime,
                totalSessions,
                averageFocusScore: Math.round(averageFocusScore),
                subjectDistribution
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve analytics', error: error.message });
        }
    }
};
