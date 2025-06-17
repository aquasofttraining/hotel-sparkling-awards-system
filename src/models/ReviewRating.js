import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ReviewRating extends Model {}

ReviewRating.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  review_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'reviews', // asigură-te că modelul se numește așa
      key: 'id',
    },
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'review_categories',
      key: 'id',
    },
  },
  rating_value: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false,
    validate: {
      min: 1.0,
      max: 5.0,
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'ReviewRating',
  tableName: 'review_ratings',
  timestamps: false,
});

export default ReviewRating;
