import { Router, Request, Response } from 'express';
import ReviewController from '../controllers/ReviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    userId: number;
    roleId: number;
    role?: string;
    email?: string;
    username?: string;
  };
}

router.get('/', (req: Request, res: Response) => ReviewController.getAllReviews(req, res));
router.get('/hotel/:hotelId', authenticateToken, (req: AuthRequest, res: Response) => ReviewController.getReviewsByHotel(req, res));
router.post('/', (req: Request, res: Response) => ReviewController.createReview(req, res));
router.put('/:id', (req: Request, res: Response) => ReviewController.updateReview(req, res));
router.delete('/:id', (req: Request, res: Response) => ReviewController.deleteReview(req, res));

module.exports = router;

