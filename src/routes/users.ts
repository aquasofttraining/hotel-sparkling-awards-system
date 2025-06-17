import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination
 * @access  Private - Administrator, Data Operator
 */
router.get('/', 
  authenticateToken, 
  requireRole(['Administrator', 'Data Operator']), 
  UserController.getUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID with role information
 * @access  Private - Administrator, Data Operator, or own profile
 */
router.get('/:id', 
  authenticateToken, 
  UserController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile (role changes restricted to Admin)
 * @access  Private - Administrator or own profile
 */
router.put('/:id', 
  authenticateToken, 
  UserController.updateUser
);

/**
 * @route   POST /api/users/assign-hotel-manager
 * @desc    Assign user as hotel manager
 * @access  Private - Administrator only
 */
router.post('/assign-hotel-manager', 
  authenticateToken, 
  requireRole(['Administrator']),
  UserController.assignHotelManager
);

export default router;
