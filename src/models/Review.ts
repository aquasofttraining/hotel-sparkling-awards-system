import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Review extends Model {
  id!: number;
  hotel_id!: number;
  user_id!: number;
  title?: string;
  content!: string;
  overall_rating?: number;
  review_date?: Date;
  helpful_votes?: number;
  platform?: string;
  sentiment_score?: number;
  sentiment_label?: string;
  confidence?: number;
  created_at?: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    hotel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'hotels',
        key: 'GlobalPropertyID',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    overall_rating: {
      type: DataTypes.DECIMAL(3, 2),
    },
    review_date: {
      type: DataTypes.DATEONLY,
    },
    helpful_votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    platform: {
      type: DataTypes.STRING(100),
    },
    sentiment_score: {
      type: DataTypes.DECIMAL(3, 2),
    },
    sentiment_label: {
      type: DataTypes.STRING(20),
    },
    confidence: {
      type: DataTypes.DECIMAL(3, 2),
    },
    createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW,
  }
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: false,
  }
);

export default Review;
