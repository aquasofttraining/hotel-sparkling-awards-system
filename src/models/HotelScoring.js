import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class HotelScoring extends Model {}

HotelScoring.init({
  ranking: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'hotels',
      key: 'GlobalPropertyID'
    }
  },
  hotel_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  location: {
    type: DataTypes.TEXT,
  },
  sparkling_score: {
    type: DataTypes.DECIMAL(5, 2),
  },
  review_component: {
    type: DataTypes.DECIMAL(5, 2),
  },
  metadata_component: {
    type: DataTypes.DECIMAL(5, 2),
  },
  sentiment_score: {
    type: DataTypes.DECIMAL(5, 2),
  },
  total_reviews: {
    type: DataTypes.INTEGER,
  },
  hotel_stars: {
    type: DataTypes.INTEGER,
  },
  distance_to_airport: {
    type: DataTypes.DECIMAL(5, 2),
  },
  floors_number: {
    type: DataTypes.INTEGER,
  },
  rooms_number: {
    type: DataTypes.INTEGER,
  },
  amenities_rate: {
    type: DataTypes.DECIMAL(5, 2),
  },
  cleanliness_rate: {
    type: DataTypes.DECIMAL(5, 2),
  },
  food_beverage: {
    type: DataTypes.DECIMAL(5, 2),
  },
  sleep_quality: {
    type: DataTypes.DECIMAL(5, 2),
  },
  internet_quality: {
    type: DataTypes.DECIMAL(5, 2),
  },
  last_updated: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'HotelScoring',
  tableName: 'hotel_scoring_table',
  timestamps: false
});

export default HotelScoring;
