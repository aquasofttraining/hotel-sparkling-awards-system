import { Router, Request, Response } from 'express';
import ScoringController from '../controllers/ScoringController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, (req: Request, res: Response) => ScoringController.getHotelScoring(req, res));

router.post('/calculate/:hotelId',
  authenticateToken,
  requireRole(['Administrator', 'administrator', 'Data Operator', 'data_operator', 'Hotel Manager','hotel_manager']),
  (req: Request, res: Response) => ScoringController.calculateHotelScore(req, res)
);

router.post('/recalculate-all',
  authenticateToken,
  requireRole(['Administrator','administrator', 'Data Operator','data_operator']),
  (req: Request, res: Response) => ScoringController.recalculateAllScores(req, res)
);

module.exports = router;

