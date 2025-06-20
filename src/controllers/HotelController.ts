import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Hotel, HotelScoring, Review, HotelManager, Role, User } from '../models';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    roleId: number;
    role?: string;
    email?: string;
    username?: string;
  };
}

class HotelController {
  // Helper method to check if user is hotel manager for specific hotel
  private async isHotelManager(userId: number, hotelId: number): Promise<boolean> {
    const managerRecord = await HotelManager.findOne({
      where: {
        userId,
        hotelId,
        isActive: true
      }
    });
    return !!managerRecord;
  }

  // Helper method to get managed hotel IDs for a manager
  private async getManagedHotelIds(userId: number): Promise<number[]> {
    const managedHotels = await HotelManager.findAll({
      where: { userId, isActive: true },
      attributes: ['hotelId']
    });
    return managedHotels.map(hm => hm.hotelId);
  }

  //  Auto-scoring helper methods
  private async calculateHotelScore(hotel: any): Promise<{
    sparklingScore: number;
    reviewComponent: number;
    metadataComponent: number;
  }> {
    console.log(' Calculating scores for hotel:', hotel.GlobalPropertyName);

    const starRating = hotel.HotelStars || 1;
    
    // Metadata Component (40% of total score)
    const metadataScore = this.calculateMetadataScore({
      stars: starRating,
      rooms: hotel.RoomsNumber || 0,
      floors: hotel.FloorsNumber || 0,
      distanceToAirport: hotel.DistanceToTheAirport || 0
    });

    // Review Component (60% of total score) 
    const reviewScore = this.estimateReviewScore(metadataScore, starRating);

    // Sparkling Score = (Review * 0.6) + (Metadata * 0.4)
    const sparklingScore = (reviewScore * 0.6) + (metadataScore * 0.4);

    return {
      sparklingScore: Number(sparklingScore.toFixed(2)),
      reviewComponent: Number(reviewScore.toFixed(2)),
      metadataComponent: Number(metadataScore.toFixed(2))
    };
  }

  private calculateMetadataScore(metadata: {
    stars: number;
    rooms: number;
    floors: number;
    distanceToAirport: number;
  }): number {
    let score = 0;

    // Star rating component (0-5 stars = 20-100 points)
    score += (metadata.stars / 5) * 80 + 20;

    // Room count bonus
    if (metadata.rooms > 200) score += 10;
    else if (metadata.rooms > 100) score += 5;

    // Floor count bonus
    if (metadata.floors > 10) score += 5;
    else if (metadata.floors > 5) score += 2;

    // Distance penalty/bonus
    if (metadata.distanceToAirport < 5) score += 5;
    else if (metadata.distanceToAirport > 20) score -= 5;

    return Math.min(Math.max(score, 20), 100);
  }

  private estimateReviewScore(metadataScore: number, starRating: number): number {
    const baseScore = metadataScore * 0.85;
    const starBonus = (starRating / 5) * 10;
    const randomVariance = (Math.random() - 0.5) * 10;

    return Math.min(Math.max(baseScore + starBonus + randomVariance, 20), 100);
  }

  //  Recalculate rankings after new hotel addition
  private async recalculateRankings(): Promise<void> {
    try {
      console.log(' Recalculating leaderboard rankings...');

      const scoringEntries = await HotelScoring.findAll({
        order: [['sparkling_score', 'DESC']],
        raw: true
      });

      for (let i = 0; i < scoringEntries.length; i++) {
        const entry = scoringEntries[i];
        await HotelScoring.update(
          { ranking: i + 1 },
          { where: { hotelId: entry.hotelId } }
        );
      }

      console.log(' Rankings recalculated for', scoringEntries.length, 'hotels');
    } catch (error) {
      console.error(' Error recalculating rankings:', error);
    }
  }

  public async getHotels(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      let whereClause: any = {};

      // Search functionality
      if (search) {
        whereClause.GlobalPropertyName = {
          [Op.iLike]: `%${search}%`
        };
      }

      // Role-based filtering
      switch (user.roleId) {
        case 1: { // Hotel Manager - only their assigned hotels
          const hotelIds = await this.getManagedHotelIds(user.userId);
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
          break;
        }
        case 2: // Traveler - can see all hotels
        case 3: // Administrator - can see all hotels
        case 4: // Data Operator - can see all hotels
          break;
        default:
          res.status(403).json({ success: false, message: 'Access denied: Invalid role' });
          return;
      }

      const { count, rows: hotels } = await Hotel.findAndCountAll({
        where: whereClause,
        limit: Number(limit),
        offset,
        order: [['GlobalPropertyName', 'ASC']],
        include: [{ model: HotelScoring, as: 'scoring' }]
      });

      console.log(` Found ${hotels.length} hotels for user role ${user.roleId}`);

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
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

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

      // Role-based access control
      switch (user.roleId) {
        case 2: // Traveler - can view all hotels
        case 3: // Administrator - full access
        case 4: // Data Operator - full access
          res.json({ success: true, data: hotel });
          return;

        case 1: { // Hotel Manager - only their assigned hotels
          const isManager = await this.isHotelManager(user.userId, Number(id));
          if (!isManager) {
            res.status(403).json({ success: false, message: 'Access denied: Not a manager of this hotel' });
            return;
          }
          res.json({ success: true, data: hotel });
          return;
        }

        default:
          res.status(403).json({ success: false, message: 'Access denied: Invalid role' });
          return;
      }
    } catch (error) {
      console.error('Get hotel by ID error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch hotel' });
    }
  }

  public async getHotelByName(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

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

      // Role-based access control
      switch (user.roleId) {
        case 2: // Traveler - can view all hotels
        case 3: // Administrator - full access
        case 4: // Data Operator - full access
          res.json({ success: true, data: hotel });
          return;

        case 1: { // Hotel Manager - only their assigned hotels
          const isManager = await this.isHotelManager(user.userId, hotel.GlobalPropertyID);
          if (!isManager) {
            res.status(403).json({ success: false, message: 'Access denied: Not a manager of this hotel' });
            return;
          }
          res.json({ success: true, data: hotel });
          return;
        }

        default:
          res.status(403).json({ success: false, message: 'Access denied: Invalid role' });
          return;
      }
    } catch (error) {
      console.error('Get hotel by name error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch hotel by name' });
    }
  }

  //  Create hotel with auto-scoring and leaderboard integration
  public async createHotel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Role-based access control for hotel creation
      switch (user.roleId) {
        case 3: // Administrator - can create hotels
        case 4: // Data Operator - can create hotels
          break;
        case 1: // Hotel Manager - cannot create hotels
        case 2: // Traveler - cannot create hotels
        default:
          res.status(403).json({ 
            success: false, 
            message: 'Access denied: Only administrators and data operators can create hotels' 
          });
          return;
      }

      console.log('Creating hotel and adding to leaderboard');
      console.log('Request data:', req.body);

      const hotelData = {
        ...req.body,
        last_updated: new Date()
      };
      
      const hotel = await Hotel.create(hotelData);
      
      console.log(' Hotel created:', {
        hotelId: hotel.GlobalPropertyID,
        hotelName: hotel.GlobalPropertyName,
        createdBy: user.userId,
        userRole: user.roleId
      });

      //  AUTO-SCORE THE NEW HOTEL
      const scoring = await this.calculateHotelScore(hotel);
      console.log('📊 Calculated scores:', scoring);

          
      // Get current max ranking and add 1
      const maxRanking = (await HotelScoring.max('ranking') as number) || 0;
      const newRanking = Number(maxRanking) + 1;

      // Add to leaderboard with proper type handling
      await HotelScoring.create({
        ranking: newRanking,
        hotelId: hotel.GlobalPropertyID,
        hotelName: hotel.GlobalPropertyName || 'Unknown Hotel', //  Handle undefined
        sparklingScore: Number(scoring.sparklingScore), //  Ensure number type
        reviewComponent: Number(scoring.reviewComponent), //  Ensure number type  
        metadataComponent: Number(scoring.metadataComponent), //  Ensure number type
        totalReviews: 0,
        hotelStars: Number(hotel.HotelStars) || 1 //  Handle undefined
      });


      console.log('🏆 Hotel added to leaderboard at rank:', newRanking);

      // Recalculate rankings to properly position the new hotel
      await this.recalculateRankings();

      res.status(201).json({ 
        success: true, 
        data: hotel,
        scoring: scoring,
        ranking: newRanking,
        message: 'Hotel created and added to leaderboard successfully' 
      });
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
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const hotel = await Hotel.findByPk(id);
      if (!hotel) {
        res.status(404).json({ success: false, message: 'Hotel not found' });
        return;
      }

      // Role-based access control for hotel updates
      switch (user.roleId) {
        case 3: // Administrator - can update any hotel
        case 4: // Data Operator - can update any hotel
          console.log('Admin/Data Operator updating hotel:', {
            hotelId: id,
            userId: user.userId,
            roleId: user.roleId
          });
          break;

        case 1: { // Hotel Manager - can only update their assigned hotels
          const isManager = await this.isHotelManager(user.userId, Number(id));
          if (!isManager) {
            res.status(403).json({ 
              success: false, 
              message: 'Access denied: You are not the manager of this hotel' 
            });
            return;
          }
          console.log('Hotel Manager updating assigned hotel:', {
            hotelId: id,
            managerId: user.userId
          });
          break;
        }

        case 2: // Traveler - cannot update hotels
        default:
          res.status(403).json({ 
            success: false, 
            message: 'Access denied: Insufficient permissions to update hotels' 
          });
          return;
      }

      const updatedHotel = await hotel.update({ 
        ...req.body, 
        last_updated: new Date() 
      });

      //  UPDATE SCORING IF METADATA CHANGED
      const metadataFields = ['HotelStars', 'RoomsNumber', 'FloorsNumber', 'DistanceToTheAirport'];
      const hasMetadataChanges = metadataFields.some(field => req.body[field] !== undefined);

      if (hasMetadataChanges) {
        console.log('🔄 Metadata changed, recalculating scores...');
        const newScoring = await this.calculateHotelScore(updatedHotel);
        
        await HotelScoring.update({
          sparklingScore: newScoring.sparklingScore,
          reviewComponent: newScoring.reviewComponent,
          metadataComponent: newScoring.metadataComponent,
          hotelStars: updatedHotel.HotelStars
        }, {
          where: { hotelId: id }
        });

        console.log('📊 Scores updated:', newScoring);
        await this.recalculateRankings();
      }

      console.log('Hotel updated successfully:', {
        hotelId: id,
        hotelName: hotel.GlobalPropertyName,
        updatedBy: user.userId,
        userRole: user.roleId
      });

      res.json({ 
        success: true, 
        data: updatedHotel, 
        message: 'Hotel updated successfully' 
      });
    } catch (error) {
      console.error('Update hotel error:', error);
      res.status(500).json({ success: false, message: 'Failed to update hotel' });
    }
  }

  public async deleteHotel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Role-based access control for hotel deletion
      switch (user.roleId) {
        case 3: // Administrator - can delete hotels
        case 4: // Data Operator - can delete hotels
          break;
        case 1: // Hotel Manager - cannot delete hotels
        case 2: // Traveler - cannot delete hotels
        default:
          res.status(403).json({ 
            success: false, 
            message: 'Access denied: Only administrators and data operators can delete hotels' 
          });
          return;
      }

      const hotel = await Hotel.findByPk(id);
      if (!hotel) {
        res.status(404).json({ success: false, message: 'Hotel not found' });
        return;
      }

      // Hard delete
      await hotel.destroy();

      // Clean up related data
      await HotelScoring.destroy({
        where: { hotelId: id }
      });

      // Deactivate hotel managers
      await HotelManager.update(
        { isActive: false },
        { where: { hotelId: id } }
      );

      // Recalculate rankings after deletion
      await this.recalculateRankings();

      console.log('Hotel deleted successfully:', {
        hotelId: id,
        hotelName: hotel.GlobalPropertyName,
        deletedBy: user.userId,
        userRole: user.roleId
      });

      res.json({ 
        success: true, 
        message: 'Hotel deleted successfully and leaderboard updated',
        data: { hotelId: id, hotelName: hotel.GlobalPropertyName }
      });
    } catch (error) {
      console.error('Delete hotel error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete hotel' });
    }
  }

  public async updateHotelMetadata(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const metadata = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Role-based access control for metadata updates
      switch (user.roleId) {
        case 3: // Administrator - can update metadata
        case 4: // Data Operator - can update metadata
          break;
        case 1: // Hotel Manager - cannot update metadata (scoring data)
        case 2: // Traveler - cannot update metadata
        default:
          res.status(403).json({ 
            success: false, 
            message: 'Access denied: Only administrators and data operators can update metadata' 
          });
          return;
      }

      const hotel = await Hotel.findByPk(id);
      if (!hotel) {
        res.status(404).json({ success: false, message: 'Hotel not found' });
        return;
      }

      // Update metadata fields
      const updateData: any = {
        last_updated: new Date()
      };

      if (metadata.distanceToAirport !== undefined) {
        updateData.DistanceToTheAirport = metadata.distanceToAirport;
      }
      if (metadata.floorsNumber !== undefined) {
        updateData.FloorsNumber = metadata.floorsNumber;
      }
      if (metadata.roomsNumber !== undefined) {
        updateData.RoomsNumber = metadata.roomsNumber;
      }
      if (metadata.hotelStars !== undefined) {
        updateData.HotelStars = metadata.hotelStars;
      }
      if (metadata.sparklingScore !== undefined) {
        updateData.sparkling_score = metadata.sparklingScore;
      }

      const updatedHotel = await hotel.update(updateData);

      //  RECALCULATE SCORES AFTER METADATA UPDATE
      const newScoring = await this.calculateHotelScore(updatedHotel);
      await HotelScoring.update({
        sparklingScore: newScoring.sparklingScore,
        reviewComponent: newScoring.reviewComponent,
        metadataComponent: newScoring.metadataComponent,
        hotelStars: updatedHotel.HotelStars
      }, {
        where: { hotelId: id }
      });

      await this.recalculateRankings();

      console.log('Hotel metadata updated:', {
        hotelId: id,
        updatedBy: user.userId,
        userRole: user.roleId,
        updatedFields: Object.keys(updateData),
        newScoring: newScoring
      });

      res.json({ 
        success: true, 
        message: 'Hotel metadata and scoring updated successfully',
        data: updatedHotel,
        scoring: newScoring
      });
    } catch (error) {
      console.error('Update metadata error:', error);
      res.status(500).json({ success: false, message: 'Failed to update metadata' });
    }
  }
}

export default new HotelController();
