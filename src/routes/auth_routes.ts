import { Router, Request, Response } from 'express';
import AuthController from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from 'types/AuthenticatedRequest';
const router = Router();

router.post('/login', (req: Request, res: Response) => AuthController.login(req, res));
router.post('/logout', (req: Request, res: Response) => AuthController.logout(req, res));


router.get('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => AuthController.getProfile(req, res));

module.exports = router;
