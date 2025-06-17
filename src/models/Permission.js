import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Permission extends Model {}

Permission.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  permission_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  sequelize,
  modelName: 'Permission',
  tableName: 'permissions',
  timestamps: false,
});

export default Permission;
