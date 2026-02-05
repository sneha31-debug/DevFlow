import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { register, login, logout, githubCallback, getMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ message: "Auth routes are working!" });
});

// Email/Password Authentication
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Get current user (protected)
router.get('/me', authMiddleware, getMe);

// GitHub OAuth
router.get('/github', (req: Request, res: Response, next: NextFunction) => {
    console.log("Starting GitHub Authentication...");
    next();
}, passport.authenticate('github', { scope: ['user:email'] }));

router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    githubCallback
);

export default router;
