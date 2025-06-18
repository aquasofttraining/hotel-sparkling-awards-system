import { Request, Response } from 'express';
import Review from '../models/Review';
import { Hotel, HotelManager } from '../models';
import { Op } from 'sequelize';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    roleId: number;
    role?: string;       // ✅ adăugat
    email?: string;      // ✅ adăugat
    username?: string;   // ✅ adăugat dacă vrei
  };
}

class ReviewController {
  
  /**
   * @desc Create a new review
   * @route POST /api/reviews
   * @access Public
   */
  static async createReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      // Permite doar utilizatorilor cu roleId = 2 (Traveler) să acceseze ruta
      if (user.roleId !== 2) {
        res.status(403).json({ success: false, message: 'Access denied: Only travelers can create reviews' });
        return;
      }

      const reviewData = {
        ...req.body,
        user_id: user.userId, // Asociază recenzia cu utilizatorul autentificat
        created_at: new Date(),
      };

      // Creează recenzia
      const newReview = await Review.create(reviewData);
      res.status(201).json({ success: true, message: 'Review created successfully', data: newReview });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({ success: false, message: 'Failed to create review' });
    }
  }



  /**
   * @desc Delete a review by ID
   * @route DELETE /api/reviews/:id
   * @access Public
   */
  static async deleteReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      // Permite doar utilizatorilor cu roleId = 2 (Traveler) sau roleId = 3 (Administrator) să acceseze ruta
      if (![2, 3].includes(user.roleId)) {
        res.status(403).json({ success: false, message: 'Access denied: Only travelers and administrators can delete reviews' });
        return;
      }

      const { id } = req.params; // ID-ul recenziei de șters

      // Găsește recenzia după ID
      const review = await Review.findByPk(id);
      if (!review) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      // Șterge recenzia
      await review.destroy();
      res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
  }

  /**
   * @desc Update a review by ID
   * @route PUT /api/reviews/:id
   * @access Public
   */
  static async updateReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      // Permite doar utilizatorilor cu roleId = 2 (Traveler) sau roleId = 3 (Administrator) să acceseze ruta
      if (![2, 3].includes(user.roleId)) {
        res.status(403).json({ success: false, message: 'Access denied: Only travelers and administrators can update reviews' });
        return;
      }

      const { id } = req.params; // ID-ul recenziei de actualizat
      const reviewData = req.body; // Datele de actualizat

      // Găsește recenzia după ID
      const review = await Review.findByPk(id);
      if (!review) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      // Dacă utilizatorul este Traveler (roleId = 2), verifică dacă este autorul recenziei
      if (user.roleId === 2 && review.user_id !== user.userId) {
        res.status(403).json({ success: false, message: 'Access denied: You can only update your own reviews' });
        return;
      }

      // Actualizează recenzia
      await review.update({ ...reviewData, updated_at: new Date() });
      res.status(200).json({ success: true, message: 'Review updated successfully', data: review });
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({ success: false, message: 'Failed to update review' });
    }
  }

  /**
   * @desc Get all reviews by hotel name
   * @route GET /api/reviews/hotel/:name
   * @access Public
   */
  static async getAllReviewsByHotelName(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name } = req.params; // Hotel name
      const user = req.user;

      // Verifică dacă utilizatorul este autentificat
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthenticated' });
        return;
      }

      // Găsește hotelul după nume (case-insensitive)
      const hotel = await Hotel.findOne({
        where: {
          GlobalPropertyName: { [Op.iLike]: name },
        },
      });

      if (!hotel) {
        res.status(404).json({ success: false, message: 'Hotel not found' });
        return;
      }

      // Role-based access control
      if (user.roleId === 1) {
        // Hotel Manager: verifică dacă este manager la acest hotel
        const isManager = await HotelManager.findOne({
          where: {
            userId: user.userId,
            hotelId: hotel.GlobalPropertyID,
            isActive: true,
          },
        });

        if (!isManager) {
          res.status(403).json({ success: false, message: 'Access denied: Not a manager of this hotel' });
          return;
        }
      } else if (![2, 3, 4].includes(user.roleId)) {
        // Dacă rolul nu este Traveler, Administrator sau Data Operator
        res.status(403).json({ success: false, message: 'Access denied: Unauthorized role' });
        return;
      }

      // Obține recenziile hotelului
      const reviews = await Review.findAll({
        where: { hotel_id: hotel.GlobalPropertyID },
        order: [['created_at', 'DESC']],
      });

      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      console.error('Error fetching reviews by hotel name:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
  }
}

export default ReviewController;