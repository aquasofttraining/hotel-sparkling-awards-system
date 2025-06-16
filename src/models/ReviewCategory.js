import  { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ReviewCategory = sequelize.define('ReviewCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'review_categories',
  timestamps: false // Pentru că avem deja `created_at` manual
});


export default ReviewCategory;
