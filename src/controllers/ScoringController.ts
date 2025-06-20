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
      const { limit = 30, page = 1, sortBy = 'sparklingScore', sortOrder = 'DESC' } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const { count, rows: scoring } = await HotelScoring.findAndCountAll({
        limit: Number(limit),
        offset,
        order: [[sortBy as string, sortOrder as string]],
        include: [{
          model: Hotel,
          as: 'hotel',
          attributes: ['GlobalPropertyName', 'PropertyAddress1', 'HotelStars'],
          required: false
        }]
      });

      res.json({ 
        success: true, 
        data: scoring,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get scoring error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch scoring data' });
    }
  }

  public async calculateHotelScore(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user as { userId: number; username: string; role: string; } | undefined;

      if (!user || !['Administrator', 'Data Operator', 'Hotel Manager'].includes(user.role)) {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
      }

      const { hotelId } = req.params;
      const weights = { ...this.defaultWeights, ...(req.body.weights || {}) };

      // ✅ Find hotel with reviews AND scoring
      const hotel = await Hotel.findByPk(hotelId, {
        include: [
          { model: Review, as: 'reviews' },
          { model: HotelScoring, as: 'scoring', required: false }
        ]
      });

      if (!hotel) {
        res.status(404).json({ success: false, message: 'Hotel not found' });
        return;
      }

      // Check permissions for Hotel Manager
      if (user.role === 'Hotel Manager') {
        const { HotelManager } = require('../models');
        const isManager = await HotelManager.findOne({
          where: { hotel_id: hotelId, user_id: user.userId, is_active: true }
        });
        
        if (!isManager) {
          res.status(403).json({ success: false, message: 'Access denied: You can only manage your assigned hotels' });
          return;
        }
      }

      console.log(`🔄 Calculating score for hotel: ${hotel.GlobalPropertyName} (ID: ${hotelId})`);

      const reviewScores = this.calculateReviewScores(hotel.reviews || []);
      const metadataScores = this.calculateMetadataScores(hotel);
      const totalScore = this.calculateWeightedScore(reviewScores, metadataScores, weights);

      // ✅ Create/update scoring with proper error handling
      const [scoring, created] = await HotelScoring.upsert({
        ranking: hotel.scoring?.ranking || 1, // Keep existing ranking or set to 1
        hotelId: Number(hotelId),
        hotelName: hotel.GlobalPropertyName || 'Unknown Hotel',
        location: hotel.PropertyAddress1 || '',
        sparklingScore: Number(totalScore.toFixed(2)),
        reviewComponent: Number(((reviewScores.amenitiesRate + reviewScores.cleanlinessRate +
          reviewScores.foodBeverage + reviewScores.sleepQuality +
          reviewScores.internetQuality) / 5).toFixed(2)),
        metadataComponent: Number(metadataScores.total.toFixed(2)),
        sentimentScore: Number(((reviewScores.amenitiesRate + reviewScores.cleanlinessRate) / 2).toFixed(2)),
        totalReviews: hotel.reviews?.length || 0,
        hotelStars: hotel.HotelStars || 0,
        distanceToAirport: hotel.DistanceToTheAirport || undefined,
        floorsNumber: hotel.FloorsNumber || undefined,
        roomsNumber: hotel.RoomsNumber || undefined,
        amenitiesRate: Number(reviewScores.amenitiesRate.toFixed(2)),
        cleanlinessRate: Number(reviewScores.cleanlinessRate.toFixed(2)),
        foodBeverage: Number(reviewScores.foodBeverage.toFixed(2)),
        sleepQuality: Number(reviewScores.sleepQuality.toFixed(2)),
        internetQuality: Number(reviewScores.internetQuality.toFixed(2)),
        lastUpdated: new Date()
      });

      console.log(`✅ ${created ? 'Created' : 'Updated'} scoring for hotel ${hotelId}`);

      // ✅ Return updated hotel with scoring data
      const updatedHotel = await Hotel.findByPk(hotelId, {
        include: [
          { model: HotelScoring, as: 'scoring', required: false }
        ]
      });

      res.json({
        success: true,
        message: 'Score calculated successfully',
        data: {
          hotelId: Number(hotelId),
          totalScore: Number(totalScore.toFixed(2)),
          reviewScores,
          metadataScores,
          weights
        },
        hotel: updatedHotel // ✅ Include updated hotel data
      });
    } catch (error) {
      console.error('Calculate score error:', error);
      res.status(500).json({ success: false, message: 'Failed to calculate score' });
    }
  }

  public async recalculateAllScores(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user as { userId: number; username: string; role: string; } | undefined;

      if (!user || !['Administrator', 'Data Operator'].includes(user.role)) {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
      }

      const weights = { ...this.defaultWeights, ...(req.body.weights || {}) };
      
      console.log('🔄 Starting recalculation of all hotel scores...');

      const hotels = await Hotel.findAll({
        include: [
          { model: Review, as: 'reviews' },
          { model: HotelScoring, as: 'scoring', required: false }
        ]
      });

      let processed = 0;
      const scoringData = [];

      for (const hotel of hotels) {
        try {
          const reviewScores = this.calculateReviewScores(hotel.reviews || []);
          const metadataScores = this.calculateMetadataScores(hotel);
          const totalScore = this.calculateWeightedScore(reviewScores, metadataScores, weights);

          scoringData.push({
            hotelId: hotel.GlobalPropertyID,
            sparklingScore: Number(totalScore.toFixed(2)),
            hotelName: hotel.GlobalPropertyName
          });

          await HotelScoring.upsert({
            ranking: processed + 1, // Temporary ranking, will be updated below
            hotelId: hotel.GlobalPropertyID,
            hotelName: hotel.GlobalPropertyName || 'Unknown Hotel',
            location: hotel.PropertyAddress1 || '',
            sparklingScore: Number(totalScore.toFixed(2)),
            reviewComponent: Number(((reviewScores.amenitiesRate + reviewScores.cleanlinessRate +
              reviewScores.foodBeverage + reviewScores.sleepQuality +
              reviewScores.internetQuality) / 5).toFixed(2)),
            metadataComponent: Number(metadataScores.total.toFixed(2)),
            sentimentScore: Number(((reviewScores.amenitiesRate + reviewScores.cleanlinessRate) / 2).toFixed(2)),
            totalReviews: hotel.reviews?.length || 0,
            hotelStars: hotel.HotelStars || 0,
            distanceToAirport: hotel.DistanceToTheAirport || undefined,
            floorsNumber: hotel.FloorsNumber || undefined,
            roomsNumber: hotel.RoomsNumber || undefined,
            amenitiesRate: Number(reviewScores.amenitiesRate.toFixed(2)),
            cleanlinessRate: Number(reviewScores.cleanlinessRate.toFixed(2)),
            foodBeverage: Number(reviewScores.foodBeverage.toFixed(2)),
            sleepQuality: Number(reviewScores.sleepQuality.toFixed(2)),
            internetQuality: Number(reviewScores.internetQuality.toFixed(2)),
            lastUpdated: new Date()
          });

          processed++;
        } catch (error) {
          console.error(`Error processing hotel ${hotel.GlobalPropertyID}:`, error);
        }
      }

      // ✅ Update rankings based on sparklingScore
      scoringData.sort((a, b) => b.sparklingScore - a.sparklingScore);
      
      for (let i = 0; i < scoringData.length; i++) {
        await HotelScoring.update(
          { ranking: i + 1 },
          { where: { hotelId: scoringData[i].hotelId } }
        );
      }

      console.log(`✅ Recalculated scores for ${processed} hotels`);

      res.json({
        success: true,
        message: `Successfully recalculated scores for ${processed} hotels`,
        data: {
          processedCount: processed,
          totalHotels: hotels.length,
          topHotels: scoringData.slice(0, 5).map(item => ({
            hotelName: item.hotelName,
            sparklingScore: item.sparklingScore
          }))
        }
      });
    } catch (error) {
      console.error('Recalculate scores error:', error);
      res.status(500).json({ success: false, message: 'Failed to recalculate scores' });
    }
  }

  private calculateReviewScores(reviews: any[]): any {
    if (reviews.length === 0) {
      return {
        amenitiesRate: 7.5, // Better default values
        cleanlinessRate: 8.0,
        foodBeverage: 7.0,
        sleepQuality: 7.5,
        internetQuality: 6.5
      };
    }

    const totals = reviews.reduce((acc, review) => ({
      amenitiesRate: acc.amenitiesRate + (review.overallRating || 7.0),
      cleanlinessRate: acc.cleanlinessRate + (review.overallRating || 7.0),
      foodBeverage: acc.foodBeverage + (review.overallRating || 7.0),
      sleepQuality: acc.sleepQuality + (review.overallRating || 7.0),
      internetQuality: acc.internetQuality + (review.overallRating || 7.0)
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
    const starScore = (hotel.HotelStars || 3) * 2; // Scale to 10
    const roomScore = this.normalizeRooms(hotel.RoomsNumber || 50);

    return {
      distance: distanceScore,
      stars: starScore,
      rooms: roomScore,
      total: (distanceScore + starScore + roomScore) / 3
    };
  }

  private normalizeDistance(distance: number): number {
    if (distance <= 5) return 10;
    if (distance >= 25) return 2;
    return 10 - ((distance - 5) / 20) * 8;
  }

  private normalizeRooms(rooms: number): number {
    if (rooms <= 20) return 4;
    if (rooms <= 50) return 6;
    if (rooms <= 100) return 8;
    return 10;
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
