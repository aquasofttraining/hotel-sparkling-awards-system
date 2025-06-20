import { Router, Request, Response } from 'express';
import ScoringController from '../controllers/ScoringController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, (req: Request, res: Response) => ScoringController.getHotelScoring(req, res));

router.post('/calculate/:hotelId',
  authenticateToken,
  requireRole(['Administrator', 'Data Operator', 'Hotel Manager']),
  (req: Request, res: Response) => ScoringController.calculateHotelScore(req, res)
);

router.post('/recalculate-all',
  authenticateToken,
  requireRole(['Administrator', 'Data Operator']),
  (req: Request, res: Response) => ScoringController.recalculateAllScores(req, res)
);

export default router;
