import { Request, Response } from 'express';
import { User, Role, HotelManager, Hotel } from '../models';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';


class UserManagementController {
  // Get all users with pagination and filtering
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      // Only administrators can access user management
      if (!user || user.role !== 'administrator') {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        role = '', 
        status = '' 
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      // Build where conditions
      const whereConditions: any = {};
      
      if (search) {
        whereConditions[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (status) {
        whereConditions.accountStatus = status;
      }

      // Role filtering
      let roleWhere = {};
      if (role) {
        roleWhere = { role: role };
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Role,
            as: 'role',
            where: Object.keys(roleWhere).length > 0 ? roleWhere : undefined,
            required: false
          },
          {
            model: HotelManager,
            as: 'managedHotels',
            include: [
              {
                model: Hotel,
                as: 'hotel',
                attributes: ['GlobalPropertyID', 'GlobalPropertyName']
              }
            ],
            required: false
          }
        ],
        limit: Number(limit),
        offset: offset,
        order: [['createdAt', 'DESC']],
        distinct: true
      });

      res.json({
        success: true,
        data: {
          users: users,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  }

  // Create new user
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      if (!user || user.role !== 'administrator') {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const {
        username,
        email,
        password,
        firstName,
        lastName,
        roleId,
        accountStatus = 'active',
        hotelIds = []
      } = req.body;

      // Validate required fields
      if (!username || !email || !password || !roleId) {
        res.status(400).json({ 
          success: false, 
          message: 'Username, email, password, and role are required' 
        });
        return;
      }

      // Check if username or email already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        res.status(400).json({ 
          success: false, 
          message: 'Username or email already exists' 
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await User.create({
        username,
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        roleId: Number(roleId),
        accountStatus,
        emailVerified: true, // Admin-created users are pre-verified
        reviewCount: 0
      });

      // If user is Hotel Manager, assign hotels
      if (hotelIds.length > 0) {
        const role = await Role.findByPk(roleId);
        if (role?.role === 'Hotel Manager') {
          for (const hotelId of hotelIds) {
            await HotelManager.create({
              userId: newUser.id,
              hotelId: Number(hotelId),
              assignedBy: user.userId,
              isActive: true,
              assignedAt: new Date()
            });
          }
        }
      }

      // Fetch created user with relations
      const createdUser = await User.findByPk(newUser.id, {
        include: [
          { model: Role, as: 'role' },
          { 
            model: HotelManager, 
            as: 'managedHotels',
            include: [{ model: Hotel, as: 'hotel' }]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: createdUser }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ success: false, message: 'Failed to create user' });
    }
  }

  // Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      if (!user || user.role !== 'administrator') {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const { userId } = req.params;
      const {
        username,
        email,
        firstName,
        lastName,
        roleId,
        accountStatus,
        hotelIds = []
      } = req.body;

      const targetUser = await User.findByPk(userId);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // Prevent admin from deactivating themselves
      if (Number(userId) === user.userId && accountStatus === 'inactive') {
        res.status(400).json({ 
          success: false, 
          message: 'Cannot deactivate your own account' 
        });
        return;
      }

      // Update user fields
      await targetUser.update({
        username: username || targetUser.username,
        email: email || targetUser.email,
        firstName: firstName || targetUser.firstName,
        lastName: lastName || targetUser.lastName,
        roleId: roleId ? Number(roleId) : targetUser.roleId,
        accountStatus: accountStatus || targetUser.accountStatus
      });

      // Update hotel assignments for Hotel Managers
      if (roleId) {
        const role = await Role.findByPk(roleId);
        if (role?.role === 'Hotel Manager') {
          // Remove existing assignments
          await HotelManager.destroy({
            where: { userId: Number(userId) }
          });

          // Add new assignments
          for (const hotelId of hotelIds) {
            await HotelManager.create({
              userId: Number(userId),
              hotelId: Number(hotelId),
              assignedBy: user.userId,
              isActive: true,
              assignedAt: new Date()
            });
          }
        } else {
          // If role changed from Hotel Manager, remove all hotel assignments
          await HotelManager.destroy({
            where: { userId: Number(userId) }
          });
        }
      }

      // Fetch updated user with relations
      const updatedUser = await User.findByPk(userId, {
        include: [
          { model: Role, as: 'role' },
          { 
            model: HotelManager, 
            as: 'managedHotels',
            include: [{ model: Hotel, as: 'hotel' }]
          }
        ]
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  }

  // Delete user (soft delete by setting status to inactive)
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      if (!user || user.role !== 'administrator') {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const { userId } = req.params;

      // Prevent admin from deleting themselves
      if (Number(userId) === user.userId) {
        res.status(400).json({ 
          success: false, 
          message: 'Cannot delete your own account' 
        });
        return;
      }

      const targetUser = await User.findByPk(userId);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // Soft delete by setting status to inactive
      await targetUser.update({ accountStatus: 'inactive' });

      // Deactivate hotel management assignments
      await HotelManager.update(
        { isActive: false },
        { where: { userId: Number(userId) } }
      );

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  }

  // Get all roles
  async getRoles(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      if (!user || user.role !== 'administrator') {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const roles = await Role.findAll({
        order: [['id', 'ASC']]
      });

      res.json({
        success: true,
        data: { roles }
      });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch roles' });
    }
  }

  // Get all hotels (for assigning to managers)
  async getHotels(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      if (!user || user.role !== 'administrator') {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const hotels = await Hotel.findAll({
        attributes: ['GlobalPropertyID', 'GlobalPropertyName', 'PropertyAddress1'],
        order: [['GlobalPropertyName', 'ASC']]
      });

      res.json({
        success: true,
        data: { hotels }
      });
    } catch (error) {
      console.error('Get hotels error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch hotels' });
    }
  }
}

export default new UserManagementController();
