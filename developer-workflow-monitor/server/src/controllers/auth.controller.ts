import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.model';

// Register a new user with email/password
export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, displayName } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide username, email, and password' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            displayName: displayName || username,
            authProvider: 'local',
        });

        // Generate JWT
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login with email/password
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user and include password
        const user = await User.findOne({ email, authProvider: 'local' }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GitHub callback (already exists, keep it)
export const githubCallback = (req: Request, res: Response) => {
    const user = req.user as IUser;

    if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = generateToken(user);
    res.redirect(`http://localhost:5173/login?token=${token}`);
};

// Get current user profile
export const getMe = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                authProvider: user.authProvider,
                createdAt: user.createdAt,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Logout (just informational, client handles token removal)
export const logout = (req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully' });
};

// Helper function to generate JWT
function generateToken(user: IUser): string {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
        },
        process.env.JWT_SECRET || 'supersecretkey',
        { expiresIn: '7d' }
    );
}
