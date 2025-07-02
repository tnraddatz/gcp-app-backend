import { Router, Request, Response } from 'express';
import {authenticateToken} from '../middleware/authenticateToken';

const router = Router();

router.get('/user', authenticateToken, (req: Request, res: Response) => {
  // Cast req to AuthenticatedRequest to access the 'user' property
  res.json({ user: req.user, message: 'User data (Authenticated)' });
});

export default router;