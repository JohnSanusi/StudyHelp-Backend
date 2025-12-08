import 'dotenv/config';

export const config = {
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'development',
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
};
