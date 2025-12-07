import 'dotenv/config';

export const config = {
    PORT: process.env.PORT || 8080,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    NODE_ENV: process.env.NODE_ENV || 'development',
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};
