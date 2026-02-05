import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.model';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
            callbackURL: "http://localhost:5000/api/auth/github/callback",
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
                // Check if user already exists
                let user = await User.findOne({ githubId: profile.id });

                if (!user) {
                    // Create new user
                    user = await User.create({
                        githubId: profile.id,
                        username: profile.username,
                        email: profile.emails?.[0]?.value,
                        avatarUrl: profile.photos?.[0]?.value,
                        displayName: profile.displayName,
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialization (for sessions, though we might use JWTs primarily)
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
