import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class HotelManager extends Model {}

HotelManager.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'hotels',
      key: 'GlobalPropertyID',
    },
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
        model: 'users',
        key: 'id',
  }, 
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, 
  sequelize,
  modelName: 'HotelManager',
  tableName: 'hotel_managers',
  timestamps: false,
});

export default HotelManager;
