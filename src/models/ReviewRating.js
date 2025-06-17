import  { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ReviewRating = sequelize.define('ReviewRating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  review_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating_value: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
    validate: {
      min: 1.0,
      max: 5.0
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'review_ratings',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['review_id', 'category_id']
    }
  ]
});


export default ReviewRating;
