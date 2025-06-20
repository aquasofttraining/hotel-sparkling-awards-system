import { Router, Request, Response } from 'express';
import HotelController from '../controllers/HotelController';
import { authenticateToken, requireRole } from '../middleware/auth';

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

router.get('/debug/auth', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: 'Debug route working',
    user: req.user
  });
});

router.get('/', authenticateToken, (req: AuthRequest, res: Response) => HotelController.getHotels(req, res));
router.get('/:id', authenticateToken, (req: AuthRequest, res: Response) => HotelController.getHotelById(req, res));
router.get('/name/:name', authenticateToken, (req: AuthRequest, res: Response) => HotelController.getHotelByName(req, res));

router.post('/', 
  authenticateToken, 
  requireRole(['Administrator', 'administrator', 'Data Operator', 'data operator']),
  (req: AuthRequest, res: Response) => HotelController.createHotel(req, res)
);

router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => HotelController.updateHotel(req, res));
router.delete('/:id', 
  authenticateToken,
  requireRole(['Administrator', 'administrator', 'Data Operator', 'data operator']),
  (req: AuthRequest, res: Response) => HotelController.deleteHotel(req, res)
);

router.put('/:id/metadata',
  authenticateToken,
  requireRole(['Administrator', 'administrator', 'Data Operator', 'data operator']),
  (req: AuthRequest, res: Response) => HotelController.updateHotelMetadata(req, res)
);

module.exports = router;
