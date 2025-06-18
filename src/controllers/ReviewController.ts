import { Request, Response } from 'express';
import Review from '../models/Review';
import { Hotel, HotelManager } from '../models';

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
   * @desc Get all reviews
   * @route GET /api/reviews
   * @access Public
   */
  static async getAllReviews(req: Request, res: Response): Promise<void> {
    try {
      const reviews = await Review.findAll();
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getReviewsByHotel(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { hotelId } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    // Dacă este manager, verificăm dacă este manager la acel hotel
    if (user.roleId === 1) {
      const isManager = await HotelManager.findOne({
        where: {
          userId: user.userId,
          hotelId: Number(hotelId),
          isActive: true
        }
      });

      if (!isManager) {
        res.status(403).json({ success: false, message: 'Access denied: not manager of this hotel' });
        return;
      }
    }

    // Admin, Data Operator, Traveler văd direct
    // (poți restricționa Traveler după nevoie)

    try {
      const reviews = await Review.findAll({
        where: { hotelId: Number(hotelId) },
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
  }


  /**
   * @desc Create a new review
   * @route POST /api/reviews
   * @access Public
   */
  static async createReview(req: Request, res: Response): Promise<void> {
  const {
    user_id,
    hotel_id,
    title,
    content,
    overall_rating,
    review_date,
    helpful_votes,
    platform,
    sentiment_score,
    sentiment_label,
    confidence
  } = req.body;

  try {
    const newReview = await Review.create({
      user_id,
      hotel_id,
      title,
      content,
      overall_rating,
      review_date,
      helpful_votes,
      platform,
      sentiment_score,
      sentiment_label,
      confidence
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


  /**
   * @desc Delete a review by ID
   * @route DELETE /api/reviews/:id
   * @access Public
   */
  static async deleteReview(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const review = await Review.findByPk(id);
      if (!review) {
        res.status(404).json({ message: 'Review not found' });
        return;
      }

      await review.destroy();
      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * @desc Update a review by ID
   * @route PUT /api/reviews/:id
   * @access Public
   */
  static async updateReview(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const {
      title,
      content,
      overall_rating,
      helpful_votes,
      platform,
      sentiment_score,
      sentiment_label,
      confidence,
    } = req.body;

    try {
      const review = await Review.findByPk(id);
      if (!review) {
        res.status(404).json({ message: 'Review not found' });
        return;
      }

      // Update the review fields
      review.title = title ?? review.title;
      review.content = content ?? review.content;
      review.overall_rating = overall_rating ?? review.overall_rating;
      review.helpful_votes = helpful_votes ?? review.helpful_votes;
      review.platform = platform ?? review.platform;
      review.sentiment_score = sentiment_score ?? review.sentiment_score;
      review.sentiment_label = sentiment_label ?? review.sentiment_label;
      review.confidence = confidence ?? review.confidence;

      await review.save();
      res.status(200).json({ message: 'Review updated successfully', review });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default ReviewController;