import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface HotelScoringAttributes {
  ranking: number;
  hotelId: number;
  hotelName: string;
  location?: string;
  sparklingScore?: number;
  reviewComponent?: number;
  metadataComponent?: number;
  sentimentScore?: number;
  totalReviews?: number;
  hotelStars?: number;
  distanceToAirport?: number;
  floorsNumber?: number;
  roomsNumber?: number;
  amenitiesRate?: number;
  cleanlinessRate?: number;
  foodBeverage?: number;
  sleepQuality?: number;
  internetQuality?: number;
  lastUpdated?: Date;
}

interface HotelScoringCreationAttributes extends Optional<HotelScoringAttributes, 'ranking'> {}

class HotelScoring extends Model<HotelScoringAttributes, HotelScoringCreationAttributes> implements HotelScoringAttributes {
  public ranking!: number;
  public hotelId!: number;
  public hotelName!: string;
  public location?: string;
  public sparklingScore?: number;
  public reviewComponent?: number;
  public metadataComponent?: number;
  public sentimentScore?: number;
  public totalReviews?: number;
  public hotelStars?: number;
  public distanceToAirport?: number;
  public floorsNumber?: number;
  public roomsNumber?: number;
  public amenitiesRate?: number;
  public cleanlinessRate?: number;
  public foodBeverage?: number;
  public sleepQuality?: number;
  public internetQuality?: number;
  public lastUpdated?: Date;
}

HotelScoring.init({
  ranking: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  hotelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'hotel_id',
  },
  hotelName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'hotel_name',
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sparklingScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'sparkling_score',
  },
  reviewComponent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'review_component',
  },
  metadataComponent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'metadata_component',
  },
  sentimentScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'sentiment_score',
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'total_reviews',
  },
  hotelStars: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'hotel_stars',
  },
  distanceToAirport: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'distance_to_airport',
  },
  floorsNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'floors_number',
  },
  roomsNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'rooms_number',
  },
  amenitiesRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'amenities_rate',
  },
  cleanlinessRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'cleanliness_rate',
  },
  foodBeverage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'food_beverage',
  },
  sleepQuality: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'sleep_quality',
  },
  internetQuality: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'internet_quality',
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_updated',
  },
}, {
  sequelize,
  modelName: 'HotelScoring',
  tableName: 'hotel_scoring_table',
  timestamps: false,
  underscored: false,
});

export default HotelScoring;
