import { Request, Response } from 'express';
import { User, Role, HotelManager } from '../models';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

class UserController {
  public async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const { count, rows: users } = await User.findAndCountAll({
        limit: Number(limit),
        offset,
        order: [['username', 'ASC']],
        attributes: { exclude: ['passwordHash'] },
        include: [{ model: Role, as: 'role' }]
      });

      res.json({
        success: true,
        data: users,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['passwordHash'] }
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
  }

  public async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Remove sensitive fields
      delete updateData.passwordHash;
      delete updateData.id;

      const user = await User.findByPk(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // Only admins can change roles
      if (updateData.roleId && req.user?.role !== 'Administrator') {
        res.status(403).json({ success: false, message: 'Only administrators can change roles' });
        return;
      }

      await user.update(updateData);
      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  }

  public async assignHotelManager(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId, hotelId } = req.body;

      if (!userId || !hotelId) {
        res.status(400).json({ success: false, message: 'User ID and Hotel ID are required' });
        return;
      }

      const assignment = await HotelManager.create({
        userId,
        hotelId,
        assignedBy: req.user!.userId,
        isActive: true
      });

      res.status(201).json({ success: true, data: assignment });
    } catch (error) {
      console.error('Assign manager error:', error);
      res.status(500).json({ success: false, message: 'Failed to assign hotel manager' });
    }
  }
}

export default new UserController();
