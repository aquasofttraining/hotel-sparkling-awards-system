import { Router } from 'express';
import ScoringController from '../controllers/ScoringController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/scoring
 * @desc    Get hotel scoring leaderboard
 * @access  Private - All authenticated users
 */
router.get('/', 
  authenticateToken, 
  ScoringController.getHotelScoring
);

/**
 * @route   POST /api/scoring/calculate/:hotelId
 * @desc    Calculate weighted score for specific hotel
 * @access  Private - Administrator, Data Operator, Hotel Manager (own hotels)
 */
router.post('/calculate/:hotelId', 
  authenticateToken, 
  requireRole(['Administrator', 'Data Operator', 'Hotel Manager']),
  ScoringController.calculateHotelScore
);

/**
 * @route   POST /api/scoring/recalculate-all
 * @desc    Recalculate scores for all hotels in system
 * @access  Private - Administrator, Data Operator only
 */
router.post('/recalculate-all', 
  authenticateToken, 
  requireRole(['Administrator', 'Data Operator']),
  ScoringController.recalculateAllScores
);

export default router;
