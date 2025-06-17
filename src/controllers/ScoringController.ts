import { Request, Response } from 'express';
import { Hotel, HotelScoring, Review } from '../models';

interface ScoringWeights {
  amenitiesRate: number;
  cleanlinessRate: number;
  foodBeverage: number;
  sleepQuality: number;
  internetQuality: number;
  distanceToAirport: number;
  hotelStars: number;
  roomsNumber: number;
}

class ScoringController {
  private defaultWeights: ScoringWeights = {
    amenitiesRate: 0.20,
    cleanlinessRate: 0.25,
    foodBeverage: 0.15,
    sleepQuality: 0.20,
    internetQuality: 0.10,
    distanceToAirport: 0.05,
    hotelStars: 0.03,
    roomsNumber: 0.02
  };

  public async getHotelScoring(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 20 } = req.query;

      const scoring = await HotelScoring.findAll({
        limit: Number(limit),
        order: [['sparklingScore', 'DESC']],
        include: [{ 
          model: Hotel, 
          as: 'hotel',
          attributes: ['GlobalPropertyName', 'PropertyAddress1', 'HotelStars']
        }]
      });

      res.json({ success: true, data: scoring });
    } catch (error) {
      console.error('Get scoring error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch scoring data' });
    }
  }

  public async calculateHotelScore(req: Request, res: Response): Promise<void> {
    try {
      const { hotelId } = req.params;
      const weights = { ...this.defaultWeights, ...(req.body.weights || {}) };

      const hotel = await Hotel.findByPk(hotelId, {
        include: [{ model: Review, as: 'reviews' }]
      });

      if (!hotel) {
        res.status(404).json({ success: false, message: 'Hotel not found' });
        return;
      }

      // Calculate scores
      const reviewScores = this.calculateReviewScores(hotel.reviews || []);
      const metadataScores = this.calculateMetadataScores(hotel);
      const totalScore = this.calculateWeightedScore(reviewScores, metadataScores, weights);
      
      // Update scoring record
      await HotelScoring.upsert({
        ranking: 1,
        hotelId: Number(hotelId),
        hotelName: hotel.GlobalPropertyName || 'Unknown',
        location: hotel.PropertyAddress1 || '',
        sparklingScore: Number(totalScore.toFixed(2)),
        reviewComponent: Number(((reviewScores.amenitiesRate + reviewScores.cleanlinessRate + 
                         reviewScores.foodBeverage + reviewScores.sleepQuality + 
                         reviewScores.internetQuality) / 5).toFixed(2)),
        metadataComponent: Number(metadataScores.total.toFixed(2)),
        totalReviews: hotel.reviews?.length || 0,
        hotelStars: hotel.HotelStars,
        distanceToAirport: hotel.DistanceToTheAirport,
        roomsNumber: hotel.RoomsNumber,
        amenitiesRate: Number(reviewScores.amenitiesRate.toFixed(2)),
        cleanlinessRate: Number(reviewScores.cleanlinessRate.toFixed(2)),
        foodBeverage: Number(reviewScores.foodBeverage.toFixed(2)),
        sleepQuality: Number(reviewScores.sleepQuality.toFixed(2)),
        internetQuality: Number(reviewScores.internetQuality.toFixed(2)),
        lastUpdated: new Date()
      });

      res.json({
        success: true,
        data: {
          hotelId: Number(hotelId),
          totalScore: Number(totalScore.toFixed(2)),
          reviewScores,
          metadataScores,
          weights
        }
      });
    } catch (error) {
      console.error('Calculate score error:', error);
      res.status(500).json({ success: false, message: 'Failed to calculate score' });
    }
  }

  public async recalculateAllScores(req: Request, res: Response): Promise<void> {
    try {
      const weights = { ...this.defaultWeights, ...(req.body.weights || {}) };
      const hotels = await Hotel.findAll({
        include: [{ model: Review, as: 'reviews' }]
      });

      let processed = 0;
      for (const hotel of hotels) {
        const reviewScores = this.calculateReviewScores(hotel.reviews || []);
        const metadataScores = this.calculateMetadataScores(hotel);
        const totalScore = this.calculateWeightedScore(reviewScores, metadataScores, weights);
        
        await HotelScoring.upsert({
          ranking: 1,
          hotelId: hotel.GlobalPropertyID,
          hotelName: hotel.GlobalPropertyName || 'Unknown',
          sparklingScore: Number(totalScore.toFixed(2)),
          lastUpdated: new Date()
        });
        processed++;
      }

      res.json({
        success: true,
        message: `Recalculated scores for ${processed} hotels`
      });
    } catch (error) {
      console.error('Recalculate scores error:', error);
      res.status(500).json({ success: false, message: 'Failed to recalculate scores' });
    }
  }

  private calculateReviewScores(reviews: any[]): any {
    if (reviews.length === 0) {
      return {
        amenitiesRate: 3.0,
        cleanlinessRate: 3.0,
        foodBeverage: 3.0,
        sleepQuality: 3.0,
        internetQuality: 3.0
      };
    }

    const totals = reviews.reduce((acc, review) => ({
      amenitiesRate: acc.amenitiesRate + (review.overallRating || 3.0),
      cleanlinessRate: acc.cleanlinessRate + (review.overallRating || 3.0),
      foodBeverage: acc.foodBeverage + (review.overallRating || 3.0),
      sleepQuality: acc.sleepQuality + (review.overallRating || 3.0),
      internetQuality: acc.internetQuality + (review.overallRating || 3.0)
    }), {
      amenitiesRate: 0,
      cleanlinessRate: 0,
      foodBeverage: 0,
      sleepQuality: 0,
      internetQuality: 0
    });

    const count = reviews.length;
    return {
      amenitiesRate: totals.amenitiesRate / count,
      cleanlinessRate: totals.cleanlinessRate / count,
      foodBeverage: totals.foodBeverage / count,
      sleepQuality: totals.sleepQuality / count,
      internetQuality: totals.internetQuality / count
    };
  }

  private calculateMetadataScores(hotel: any): any {
    const distanceScore = this.normalizeDistance(hotel.DistanceToTheAirport || 10);
    const starScore = hotel.HotelStars || 3;
    const roomScore = this.normalizeRooms(hotel.RoomsNumber || 50);
    
    return {
      distance: distanceScore,
      stars: starScore,
      rooms: roomScore,
      total: (distanceScore + starScore + roomScore) / 3
    };
  }

  private normalizeDistance(distance: number): number {
    if (distance <= 5) return 5;
    if (distance >= 25) return 1;
    return 5 - ((distance - 5) / 20) * 4;
  }

  private normalizeRooms(rooms: number): number {
    if (rooms <= 20) return 2;
    if (rooms <= 50) return 3;
    if (rooms <= 100) return 4;
    return 5;
  }

  private calculateWeightedScore(reviewScores: any, metadataScores: any, weights: ScoringWeights): number {
    return (
      reviewScores.amenitiesRate * weights.amenitiesRate +
      reviewScores.cleanlinessRate * weights.cleanlinessRate +
      reviewScores.foodBeverage * weights.foodBeverage +
      reviewScores.sleepQuality * weights.sleepQuality +
      reviewScores.internetQuality * weights.internetQuality +
      metadataScores.distance * weights.distanceToAirport +
      metadataScores.stars * weights.hotelStars +
      metadataScores.rooms * weights.roomsNumber
    );
  }
}

export default new ScoringController();
