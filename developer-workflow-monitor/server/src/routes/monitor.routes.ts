import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import Monitor from '../models/Monitor.model';
import { MonitorService } from '../services/monitor.service';
import { IUser } from '../models/User.model';

const router = Router();

// Get all monitors for user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const monitors = await Monitor.find({ user: user._id })
            .sort({ createdAt: -1 });
        res.json({ monitors });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching monitors', error: error.message });
    }
});

// Create new monitor
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const { name, url, project, frequency } = req.body;

        const monitor = await Monitor.create({
            user: user._id,
            name,
            url,
            project,
            frequency: frequency || 5, // Default 5 mins
        });

        // Trigger immediate check
        MonitorService.checkMonitor(monitor._id.toString());

        res.status(201).json({ monitor });
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating monitor', error: error.message });
    }
});

// Get single monitor details
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const monitor = await Monitor.findOne({ _id: req.params.id, user: user._id });

        if (!monitor) {
            return res.status(404).json({ message: 'Monitor not found' });
        }

        res.json({ monitor });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching monitor', error: error.message });
    }
});

// Delete monitor
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const monitor = await Monitor.findOneAndDelete({ _id: req.params.id, user: user._id });

        if (!monitor) {
            return res.status(404).json({ message: 'Monitor not found' });
        }

        res.json({ message: 'Monitor deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting monitor', error: error.message });
    }
});

// Trigger manual check
router.post('/:id/check', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const monitor = await Monitor.findOne({ _id: req.params.id, user: user._id });

        if (!monitor) {
            return res.status(404).json({ message: 'Monitor not found' });
        }

        const result = await MonitorService.checkMonitor(monitor._id.toString());
        res.json({ message: 'Check triggered', result });
    } catch (error: any) {
        res.status(500).json({ message: 'Error checking monitor', error: error.message });
    }
});

export default router;
