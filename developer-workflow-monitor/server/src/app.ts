import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Developer Workflow Monitor API is running...');
});

// TODO: Import and use routes
// import authRoutes from './routes/auth.routes';
// app.use('/api/auth', authRoutes);

export default app;
