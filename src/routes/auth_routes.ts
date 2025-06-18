import { Router } from 'express';
import AuthController from '../controllers/AuthController';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return a JWT token
 * @access  Public
 */
router.post('/login', AuthController.login);

export default router;
