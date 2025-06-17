import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Hotel, HotelScoring, Review, HotelManager } from '../models';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

class HotelController {
  public async getHotels(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      let whereClause: any = {};

      // Search functionality
      if (search) {
        whereClause.GlobalPropertyName = {
          [Op.iLike]: `%${search}%`
        };
      }

      // Role-based filtering for Hotel Managers
      if (req.user?.role === 'Hotel Manager') {
        const managedHotels = await HotelManager.findAll({
          where: { userId: req.user.userId, isActive: true },
          attributes: ['hotelId']
        });
        
        const hotelIds = managedHotels.map(hm => hm.hotelId);
        if (hotelIds.length > 0) {
          whereClause.GlobalPropertyID = hotelIds;
        } else {
          res.json({ 
            success: true, 
            data: [], 
            pagination: { total: 0, page: Number(page), limit: Number(limit), totalPages: 0 }
          });
          return;
        }
      }

      const { count, rows: hotels } = await Hotel.findAndCountAll({
        where: whereClause,
        limit: Number(limit),
        offset,
        order: [['GlobalPropertyName', 'ASC']],
        include: [{ model: HotelScoring, as: 'scoring' }]
      });

      res.json({
        success: true,
        data: hotels,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get hotels error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch hotels' });
    }
  }

  public async getHotelById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const hotel = await Hotel.findByPk(id, {
        include: [
          { model: HotelScoring, as: 'scoring' },
          { model: Review, as: 'reviews', limit: 5, order: [['createdAt', 'DESC']] }
        ]
      });

      if (!hotel) {
        res.status(404).json({ success: false, message: 'Hotel not found' });
        return;
      }

      // Check access for Hotel Managers
      if (req.user?.role === 'Hotel Manager') {
        const isManager = await HotelManager.findOne({
          where: { hotelId: id, userId: req.user.userId, isActive: true }
        });
        
        if (!isManager) {
          res.status(403).json({ success: false, message: 'Access denied' });
          return;
        }
      }

      res.json({ success: true, data: hotel });
    } catch (error) {
      console.error('Get hotel error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch hotel' });
    }
  }

  public async createHotel(req: Request, res: Response): Promise<void> {
    try {
      const hotelData = {
        ...req.body,
        lastUpdated: new Date()
      };
      
      const hotel = await Hotel.create(hotelData);
      res.status(201).json({ success: true, data: hotel });
    } catch (error) {
      console.error('Create hotel error:', error);
      res.status(500).json({ success: false, message: 'Failed to create hotel' });
    }
  }

  public async updateHotel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const hotel = await Hotel.findByPk(id);
      
      if (!hotel) {
        res.status(404).json({ success: false, message: 'Hotel not found' });
        return;
      }

      // Check permissions for Hotel Managers
      if (req.user?.role === 'Hotel Manager') {
        const isManager = await HotelManager.findOne({
          where: { hotelId: id, userId: req.user.userId, isActive: true }
        });
        
        if (!isManager) {
          res.status(403).json({ success: false, message: 'Access denied' });
          return;
        }
      }

      await hotel.update({ ...req.body, lastUpdated: new Date() });
      res.json({ success: true, data: hotel });
    } catch (error) {
      console.error('Update hotel error:', error);
      res.status(500).json({ success: false, message: 'Failed to update hotel' });
    }
  }
}

export default new HotelController();
