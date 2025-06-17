import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface HotelManagerAttributes {
  id: number;
  userId: number;
  hotelId: number;
  assignedBy: number;
  assignedAt: Date;
  isActive: boolean;
}

interface HotelManagerCreationAttributes extends Optional<HotelManagerAttributes, 'id' | 'assignedAt' | 'isActive'> {}

class HotelManager extends Model<HotelManagerAttributes, HotelManagerCreationAttributes> implements HotelManagerAttributes {
  public id!: number;
  public userId!: number;
  public hotelId!: number;
  public assignedBy!: number;
  public assignedAt!: Date;
  public isActive!: boolean;
}

HotelManager.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  hotelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'hotel_id',
  },
  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'assigned_by',
  },
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'assigned_at',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  sequelize,
  modelName: 'HotelManager',
  tableName: 'hotel_managers',
  timestamps: false,
});

export default HotelManager;
