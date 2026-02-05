import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import Repository from '../models/Repository.model';
import ActivityLog from '../models/ActivityLog.model';
import { syncUserRepositories, logActivity } from '../services/github.service';
import { IUser } from '../models/User.model';

const router = Router();

// Get all repositories for logged-in user
router.get('/repos', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const repos = await Repository.find({ owner: user._id })
            .sort({ lastSyncedAt: -1 });

        res.json({ repos });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching repositories', error: error.message });
    }
});

// Sync repositories from GitHub
router.post('/repos/sync', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const count = await syncUserRepositories(user._id.toString());

        const repos = await Repository.find({ owner: user._id })
            .sort({ lastSyncedAt: -1 });

        res.json({ message: `Synced ${count} repositories`, repos });
    } catch (error: any) {
        console.error('Sync error:', error);
        res.status(500).json({ message: 'Error syncing repositories', error: error.message });
    }
});

// Get activity logs for a specific repository
router.get('/repos/:repoId/logs', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const { repoId } = req.params;

        const logs = await ActivityLog.find({
            repository: repoId,
            user: user._id
        }).sort({ timestamp: -1 }).limit(50);

        res.json({ logs });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching logs', error: error.message });
    }
});

// Get all activity logs for user
router.get('/logs', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const { limit = 50, action } = req.query;

        const query: any = { user: user._id };
        if (action) query.action = action;

        const logs = await ActivityLog.find(query)
            .populate('repository', 'name fullName')
            .sort({ timestamp: -1 })
            .limit(Number(limit));

        res.json({ logs });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching logs', error: error.message });
    }
});

// Create a manual log entry
router.post('/logs', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const { action, message, repoId, metadata } = req.body;

        if (!action || !message) {
            return res.status(400).json({ message: 'Action and message are required' });
        }

        const log = await logActivity(user._id.toString(), action, message, repoId, metadata);
        res.status(201).json({ log });
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating log', error: error.message });
    }
});

export default router;
