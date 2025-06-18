import { Router } from 'express';
import HotelController from '../controllers/HotelController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/hotels
 * @desc    Get hotels with search and pagination (filtered by role)
 * @access  Private - All authenticated users
 */
router.get('/', 
  authenticateToken, 
  HotelController.getHotels
);

/**
 * @route   GET /api/hotels/:id
 * @desc    Get hotel details with scoring and recent reviews
 * @access  Private - All users, Hotel Managers see only assigned hotels
 */
router.get('/:id', 
  authenticateToken, 
  HotelController.getHotelById
);

/**
 * @route   GET /api/hotels/name
 * @desc    Get hotel by name
 * @access  Private - Travelers, Hotel Managers, Administrators
 * */
router.get('/name/:name',
  authenticateToken,
  HotelController.getHotelByName
);

/**
 * @route   POST /api/hotels
 * @desc    Create new hotel entry
 * @access  Private - Administrator, Data Operator
 */
router.post('/', authenticateToken, HotelController.createHotel);


/**
 * @route   PUT /api/hotels/:id
 * @desc    Update hotel information
 * @access  Private - Administrator, Hotel Manager (own hotels only)
 */

router.put('/:id', authenticateToken, HotelController.updateHotel);

export default router;
