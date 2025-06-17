import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Hotel extends Model {}

Hotel.init({
  GlobalPropertyID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  GlobalPropertyName: {
    type: DataTypes.STRING(255),
  },
  PropertyAddress1: {
    type: DataTypes.TEXT,
  },
  CityID: {
    type: DataTypes.INTEGER,
  },
  PropertyStateProvinceID: {
    type: DataTypes.INTEGER,
  },
  PropertyLatitude: {
    type: DataTypes.DOUBLE,
  },
  PropertyLongitude: {
    type: DataTypes.DOUBLE,
  },
  SabrePropertyRating: {
    type: DataTypes.DECIMAL(3, 1),
  },
  HotelStars: {
    type: DataTypes.INTEGER,
  },
  DistanceToTheAirport: {
    type: DataTypes.DECIMAL(5, 2),
  },
  FloorsNumber: {
    type: DataTypes.INTEGER,
  },
  RoomsNumber: {
    type: DataTypes.INTEGER,
  },
  sparkling_score: {
    type: DataTypes.DECIMAL(5, 2),
  },
  last_updated: {
    type: DataTypes.DATE,
  },
}, {
  sequelize,
  modelName: 'Hotel',
  tableName: 'hotels',
  timestamps: false,
});

export default Hotel;
