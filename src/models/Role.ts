import { DataTypes, Optional, Model } from 'sequelize';
import sequelize from '../config/database';

interface RoleAttributes {
  id: number;
  role: string;
  description?: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'description'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public role!: string;
  public description?: string;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: false,
  }
);

export default Role;
