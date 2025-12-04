import 'dotenv/config';

export const config = {
    PORT: process.env.PORT || 8080,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    NODE_ENV: process.env.NODE_ENV || 'development'
};
