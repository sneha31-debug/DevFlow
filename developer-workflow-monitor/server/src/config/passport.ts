import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.model';
import dotenv from 'dotenv';

dotenv.config();

console.log("Initializing Passport with:");
const clientID = process.env.GITHUB_CLIENT_ID || '';
const clientSecret = process.env.GITHUB_CLIENT_SECRET || '';
console.log(`GITHUB_CLIENT_ID: ${clientID.substring(0, 5)}... (Length: ${clientID.length})`);
console.log(`GITHUB_CLIENT_SECRET: ${clientSecret.substring(0, 5)}... (Length: ${clientSecret.length})`);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
            callbackURL: "http://localhost:5001/api/auth/github/callback",
            userAgent: 'developer-workflow-monitor', // Required by GitHub
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            console.log("GitHub Auth Success:", profile.username);
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
                        authProvider: 'github',
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
