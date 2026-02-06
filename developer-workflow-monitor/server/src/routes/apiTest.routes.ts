import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import ApiTest from '../models/ApiTest.model';
import ApiTestResult from '../models/ApiTestResult.model';
import { ApiTestService } from '../services/apiTest.service';
import { IUser } from '../models/User.model';

const router = Router();

// Get all tests for user (optionally filter by project)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const { projectId } = req.query;
        const query: any = { user: user._id };

        if (projectId) {
            query.project = projectId;
        }

        const tests = await ApiTest.find(query).sort({ updatedAt: -1 });
        res.json({ tests });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching tests', error: error.message });
    }
});

// Create new test
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const { name, method, url, headers, body, assertions, project } = req.body;

        const test = await ApiTest.create({
            user: user._id,
            project,
            name,
            method,
            url,
            headers,
            body,
            assertions
        });

        res.status(201).json({ test });
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating test', error: error.message });
    }
});

// Update test
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const test = await ApiTest.findOneAndUpdate(
            { _id: req.params.id, user: user._id },
            req.body,
            { new: true }
        );

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        res.json({ test });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating test', error: error.message });
    }
});

// Delete test
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const test = await ApiTest.findOneAndDelete({ _id: req.params.id, user: user._id });

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Also delete results
        await ApiTestResult.deleteMany({ test: req.params.id });

        res.json({ message: 'Test deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting test', error: error.message });
    }
});

// Run a test
router.post('/:id/run', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const result = await ApiTestService.runTest(req.params.id as string, user._id.toString());
        res.json({ result });
    } catch (error: any) {
        res.status(500).json({ message: 'Error running test', error: error.message });
    }
});

// Get results history for a test
router.get('/:id/results', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const results = await ApiTestResult.find({ test: req.params.id, user: user._id })
            .sort({ timestamp: -1 })
            .limit(50); // Limit to last 50 runs

        res.json({ results });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching results', error: error.message });
    }
});

export default router;
