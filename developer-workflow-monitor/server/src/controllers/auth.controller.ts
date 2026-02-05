import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User.model';

export const githubCallback = (req: Request, res: Response) => {
    // Passport middleware puts the user object in req.user
    const user = req.user as IUser;

    if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    // Create JWT Token
    const payload = {
        id: user._id,
        username: user.username,
        avatarUrl: user.avatarUrl
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey', {
        expiresIn: '7d',
    });

    // Redirect to client with token
    // In production, sending token via query param is okay for redirect, 
    // but better to use cookies or a temporary code exchange.
    // For this setup, we'll redirect to a client route that grabs the token.
    res.redirect(`http://localhost:5173/login?token=${token}`);
};

export const getMe = async (req: Request, res: Response) => {
    // Middleware (to be built) will attach user to req
    // For now, return the user from the request if it exists (via session or jwt middleware)
    try {
        // Assuming a middleware decoded the token and attached user to req.user
        // We will implement that middleware shortly.
        // For now, just return a success check
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
