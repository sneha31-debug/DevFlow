import { Router } from 'express';
import passport from 'passport';
import { githubCallback, getMe } from '../controllers/auth.controller';

const router = Router();

// Redirect to GitHub for auth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback
router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    githubCallback
);

// Get current user (Protected)
// We will add the auth middleware later
router.get('/me', getMe);

export default router;
