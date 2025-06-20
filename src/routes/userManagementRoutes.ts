import { Router, Request, Response } from 'express';
import UserManagementController from '../controllers/UserManagementController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// All routes require Administrator role
router.use(authenticateToken);
router.use(requireRole(['administrator']));

// Get all users
router.get('/users', (req: Request, res: Response) => 
  UserManagementController.getAllUsers(req, res)
);

// Create new user
router.post('/users', (req: Request, res: Response) => 
  UserManagementController.createUser(req, res)
);

// Update user
router.put('/users/:userId', (req: Request, res: Response) => 
  UserManagementController.updateUser(req, res)
);

// Delete user (soft delete)
router.delete('/users/:userId', (req: Request, res: Response) => 
  UserManagementController.deleteUser(req, res)
);

// Get all roles
router.get('/roles', (req: Request, res: Response) => 
  UserManagementController.getRoles(req, res)
);

// Get all hotels
router.get('/hotels', (req: Request, res: Response) => 
  UserManagementController.getHotels(req, res)
);

export default router;