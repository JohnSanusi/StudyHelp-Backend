import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import connectDB from './config/db.js';
import passport from './config/passport.js';
import userRoutes from './routes/userRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { config } from './config/env.js';

const app = express();
const PORT = config.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Session middleware (required for Passport OAuth)
app.use(
    session({
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: config.MONGODB_URI,
            ttl: 24 * 60 * 60 // 1 day
        }),
        cookie: {
            secure: config.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/auth', authRoutes);

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'StudyHub Backend API is running' });
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
