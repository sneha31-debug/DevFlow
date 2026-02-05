import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';
import { connectDB } from './config/db';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Session Middleware (Required for Passport)
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'keyboard cat',
        resave: false,
        saveUninitialized: false,
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Developer Workflow Monitor API is running...');
});

export default app;
