import { Router } from 'express';
import ReviewController from '../controllers/ReviewController';
import { authenticateToken, requireRole } from '../middleware/auth';


const router = Router();

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews
 * @access  Public
 */
router.get('/', ReviewController.getAllReviews);

router.get('/:hotelId', authenticateToken, ReviewController.getReviewsByHotel);


/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Public
 */
router.post('/', authenticateToken, ReviewController.createReview);

router.put('/:id', authenticateToken, ReviewController.updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review by ID
 * @access  Public
 */
router.delete('/:id', ReviewController.deleteReview);

export default router;