// Script to drop the old index and let Mongoose recreate it with the new definition
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';

async function fixIndexes() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Drop the old index
        try {
            await User.collection.dropIndex('authProvider_1_providerId_1');
            console.log('Dropped old authProvider_1_providerId_1 index');
        } catch (error) {
            console.log('Index may not exist or already dropped:', error.message);
        }

        // Sync indexes (Mongoose will create the new partial index)
        await User.syncIndexes();
        console.log('Indexes synchronized successfully');

        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
}

fixIndexes();
