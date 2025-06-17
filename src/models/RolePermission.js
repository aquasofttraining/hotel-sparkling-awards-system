import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class RolePermission extends Model {}

RolePermission.init({
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id',
    },
    primaryKey: true,
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'permissions',
      key: 'id',
    },
    primaryKey: true,
  },
}, {
  sequelize,
  modelName: 'RolePermission',
  tableName: 'roles_permissions',
  timestamps: false,
});

export default RolePermission;
