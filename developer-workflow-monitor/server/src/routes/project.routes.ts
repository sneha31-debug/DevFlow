import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import Project from '../models/Project.model';
import Repository from '../models/Repository.model';
import ActivityLog from '../models/ActivityLog.model';
import { IUser } from '../models/User.model';
import { fetchProjectLogs } from '../services/github.service';

const router = Router();

// Get all projects for logged-in user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const projects = await Project.find({ owner: user._id })
            .populate('repository', 'name fullName url language stars forks isPrivate')
            .sort({ lastActivityAt: -1 });

        res.json({ projects });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
});

// Create project from repository
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const { repositoryId, name, description } = req.body;

        if (!repositoryId) {
            return res.status(400).json({ message: 'Repository ID is required' });
        }

        // Verify repository exists and belongs to user
        const repository = await Repository.findOne({ _id: repositoryId, owner: user._id });
        if (!repository) {
            return res.status(404).json({ message: 'Repository not found' });
        }

        // Check if project already exists for this repo
        const existingProject = await Project.findOne({ repository: repositoryId, owner: user._id });
        if (existingProject) {
            return res.status(400).json({ message: 'Project already exists for this repository' });
        }

        const project = await Project.create({
            name: name || repository.name,
            description: description || repository.description,
            repository: repositoryId,
            owner: user._id,
        });

        // Log the activity
        await ActivityLog.create({
            user: user._id,
            repository: repositoryId,
            action: 'PROJECT_CREATED',
            message: `Created project "${project.name}" from repository ${repository.fullName}`,
        });

        const populatedProject = await Project.findById(project._id)
            .populate('repository', 'name fullName url language stars forks isPrivate');

        res.status(201).json({ project: populatedProject });
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
});

// Get single project with logs
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const { id } = req.params;

        const project = await Project.findOne({ _id: id, owner: user._id })
            .populate('repository', 'name fullName url language stars forks isPrivate');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Fetch and sync latest logs from GitHub
        const logs = await fetchProjectLogs(id as string, user._id.toString());

        res.json({ project, logs });
    } catch (error: any) {
        console.error('Error fetching logs:', error);
        // If GitHub fetch fails, still return project with existing logs
        const project = await Project.findOne({ _id: req.params.id, owner: (req.user as IUser)._id })
            .populate('repository', 'name fullName url language stars forks isPrivate');

        const existingLogs = await ActivityLog.find({ project: req.params.id })
            .sort({ timestamp: -1 })
            .limit(50);

        res.json({ project, logs: existingLogs, error: 'Failed to sync latest activity from GitHub' });
    }
});

// Update project status
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const { id } = req.params;
        const { status, name, description } = req.body;

        const project = await Project.findOneAndUpdate(
            { _id: id, owner: user._id },
            {
                ...(status && { status }),
                ...(name && { name }),
                ...(description !== undefined && { description }),
                lastActivityAt: new Date(),
            },
            { new: true }
        ).populate('repository', 'name fullName url language');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ project });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating project', error: error.message });
    }
});

// Delete project
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const { id } = req.params;

        const project = await Project.findOneAndDelete({ _id: id, owner: user._id });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
});

export default router;
