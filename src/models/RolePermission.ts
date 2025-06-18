import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class RolePermission extends Model {
  public role_id!: number;
  public permission_id!: number;
}

RolePermission.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'permissions',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'roles_permissions',
    timestamps: false,
  }
);

export default RolePermission;
