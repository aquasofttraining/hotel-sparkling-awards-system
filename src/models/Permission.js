import  { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  permission: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  }
}, {
  tableName: 'permissions',
  timestamps: false,
});

export default Permission;
// default export

