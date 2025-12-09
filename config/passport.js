import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { config } from './env.js';

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: config.GOOGLE_CLIENT_ID,
                clientSecret: config.GOOGLE_CLIENT_SECRET,
                callbackURL: config.GOOGLE_CALLBACK_URL,
                scope: ['profile', 'email']
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists with this Google ID
                    let user = await User.findOne({
                        authProvider: 'google',
                        providerId: profile.id
                    });

                    if (user) {
                        // User exists, return the user
                        return done(null, user);
                    }

                    // Check if user exists with the same email (from local auth)
                    const existingUser = await User.findOne({
                        email: profile.emails[0].value
                    });

                    if (existingUser) {
                        // Email already exists with different auth provider
                        // Return error to prevent account hijacking
                        return done(null, false, {
                            message: 'An account with this email already exists. Please sign in using your original method.'
                        });
                    }

                    // Create new user
                    user = await User.create({
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        authProvider: 'google',
                        providerId: profile.id,
                        profilePicture: profile.photos?.[0]?.value,
                        role: 'student' // Default role
                    });

                    done(null, user);
                } catch (error) {
                    console.error('Error in Google OAuth strategy:', error);
                    done(error, null);
                }
            }
        )
    );
}

export default passport;
