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
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      // Permite doar utilizatorilor cu roleId = 2, 3, sau 4 să acceseze ruta
      if (![2, 3, 4].includes(user.roleId)) {
        res.status(403).json({ success: false, message: 'Access denied: You do not have permission to view these hotels' });
        return;
      }

      // Obține lista hotelurilor
      const hotels = await Hotel.findAll();
      res.status(200).json({ success: true, data: hotels });
    } catch (error) {
      console.error('Get hotels error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve hotels' });
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
      case 2: // Traveler
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

  public async createHotel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      // Permite doar utilizatorilor cu roleId = 3 (Administrator) sau 4 (Data Operator) să creeze hoteluri
      if (user.roleId !== 3 && user.roleId !== 4) {
        res.status(403).json({ success: false, message: 'Access denied: Only administrators can create hotels' });
        return;
      }

      // Pregătește datele hotelului
      const hotelData = {
        ...req.body,
        lastUpdated: new Date(),
      };

      // Creează hotelul
      const hotel = await Hotel.create(hotelData);

      res.status(201).json({ success: true, data: hotel });
    } catch (error) {
      console.error('Create hotel error:', error);
      res.status(500).json({ success: false, message: 'Failed to create hotel' });
    }
  }

  public async updateHotel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      const { id } = req.params; // ID-ul hotelului
      const hotelData = req.body;

      // Permite doar utilizatorilor cu roleId = 3 sau roleId = 1 să facă modificări
      if (user.roleId === 2 || user.roleId === 4) {
        res.status(403).json({ success: false, message: 'Access denied: You do not have permission to update hotels' });
        return;
      }

      // Găsește hotelul
      const hotel = await Hotel.findByPk(id);
      if (!hotel) {
        res.status(404).json({ success: false, message: 'Hotel not found' });
        return;
      }

      // RoleId = 3 (Administrator) poate modifica orice hotel
      if (user.roleId === 3) {
        await hotel.update({ ...hotelData, lastUpdated: new Date() });
        res.status(200).json({ success: true, message: 'Hotel updated successfully', data: hotel });
        return;
      }

      // RoleId = 1 (Manager) poate modifica doar hotelul pe care îl administrează
      if (user.roleId === 1) {
        const isManager = await HotelManager.findOne({
          where: {
            userId: user.userId,
            hotelId: hotel.GlobalPropertyID, // Verifică dacă utilizatorul administrează acest hotel
            isActive: true,
          },
        });

        if (!isManager) {
          res.status(403).json({ success: false, message: 'Access denied: You can only update hotels you manage' });
          return;
        }

        await hotel.update({ ...hotelData, lastUpdated: new Date() });
        res.status(200).json({ success: true, message: 'Hotel updated successfully', data: hotel });
        return;
      }

      // Dacă rolul nu este valid
      res.status(403).json({ success: false, message: 'Access denied: Invalid role' });
    } catch (error) {
      console.error('Update hotel error:', error);
      res.status(500).json({ success: false, message: 'Failed to update hotel' });
    }
  }

 
}

export default new HotelController();
