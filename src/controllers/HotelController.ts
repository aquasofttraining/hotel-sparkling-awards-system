import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Hotel, HotelScoring, Review, HotelManager, Role, User } from '../models';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    roleId: number;
    role?: string;       // ✅ adăugat
    email?: string;      // ✅ adăugat
    username?: string;   // ✅ adăugat dacă vrei
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
      if (req.user?.roleId === 1) {
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
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    // Caută hotelul cu scor și ultimele 5 review-uri
    const hotel = await Hotel.findByPk(id, {
      include: [
        { model: HotelScoring, as: 'scoring' },
        { model: Review, as: 'reviews', limit: 5, order: [['created_at', 'DESC']] }
      ]
    });

    if (!hotel) {
      res.status(404).json({ success: false, message: 'Hotel not found' });
      return;
    }

    // Role-based access
    switch (user.roleId) {
      case 3: // Administrator
      case 4: // Data Operator
        res.json({ success: true, data: hotel });
        return;

      case 1: { // Hotel Manager
        const isManager = await HotelManager.findOne({
          where: {
            userId: user.userId,
            hotelId: Number(id),
            isActive: true
          }
        });

        if (!isManager) {
          res.status(403).json({ success: false, message: 'Access denied: Not a manager of this hotel' });
          return;
        }

        res.json({ success: true, data: hotel });
        return;
      }

      default:
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
    }
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hotel' });
  }
}

public async getHotelByName(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    // Găsește hotelul după nume (case-insensitive)
    const hotel = await Hotel.findOne({
      where: {
        GlobalPropertyName: { [Op.iLike]: name }
      },
      include: [
        { model: HotelScoring, as: 'scoring' },
        { model: Review, as: 'reviews', limit: 5, order: [['created_at', 'DESC']] }
      ]
    });

    if (!hotel) {
      res.status(404).json({ success: false, message: 'Hotel not found' });
      return;
    }

    // 🔓 Travelers (2), Admins (3), Data Operators (4) au voie
    if ([2, 3, 4].includes(user.roleId)) {
      res.json({ success: true, data: hotel });
      return;
    }

    // 🔐 Hotel Manager trebuie să fie manager la acel hotel
    if (user.roleId === 1) {
      const isManager = await HotelManager.findOne({
        where: {
          userId: user.userId,
          hotelId: hotel.GlobalPropertyID,
          isActive: true
        }
      });

      if (isManager) {
        res.json({ success: true, data: hotel });
        return;
      }

      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.status(403).json({ success: false, message: 'Access denied' });
  } catch (error) {
    console.error('Get hotel by name error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hotel by name' });
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
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      const hotel = await Hotel.findByPk(id);
      if (!hotel) {
        res.status(404).json({ success: false, message: 'Hotel not found' });
        return;
      }

      // ✅ Permisiune doar pentru managerul activ al hotelului
      if (user.roleId === 1) {
        const isManager = await HotelManager.findOne({
          where: { hotelId: id, userId: user.userId, isActive: true }
        });

        if (!isManager) {
          res.status(403).json({ success: false, message: 'Access denied: You are not the manager of this hotel' });
          return;
        }
      } else {
        // ❌ Dacă nu e manager, blocăm accesul (sau extinzi pentru admin dacă vrei)
        res.status(403).json({ success: false, message: 'Access denied: Only managers can update hotel data' });
        return;
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
