import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';
import githubRoutes from './routes/github.routes';
import projectRoutes from './routes/project.routes';
import monitorRoutes from './routes/monitor.routes';
import apiTestRoutes from './routes/apiTest.routes';
import { connectDB } from './config/db';
import { MonitorService } from './services/monitor.service';

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Start Monitoring Service
MonitorService.startMonitoringLoop();

// Debugging: Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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
app.use('/api/github', githubRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/tests', apiTestRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Developer Workflow Monitor API is running...');
});

export default app;
