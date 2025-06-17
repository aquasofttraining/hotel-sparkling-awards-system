import { DataTypes, Model, Optional, NonAttribute, Association } from 'sequelize';
import sequelize from '../config/database';
import { HotelScoring, Review, HotelManager } from './index';

interface HotelAttributes {
  GlobalPropertyID: number;
  GlobalPropertyName?: string;
  PropertyAddress1?: string;
  CityID?: number;
  PropertyStateProvinceID?: number;
  PropertyLatitude?: number;
  PropertyLongitude?: number;
  SabrePropertyRating?: number;
  HotelStars?: number;
  DistanceToTheAirport?: number;
  FloorsNumber?: number;
  RoomsNumber?: number;
  sparklingScore?: number;
  lastUpdated?: Date;
}

interface HotelCreationAttributes extends Optional<HotelAttributes, 'GlobalPropertyID'> {}

class Hotel extends Model<HotelAttributes, HotelCreationAttributes> implements HotelAttributes {
  public GlobalPropertyID!: number;
  public GlobalPropertyName?: string;
  public PropertyAddress1?: string;
  public CityID?: number;
  public PropertyStateProvinceID?: number;
  public PropertyLatitude?: number;
  public PropertyLongitude?: number;
  public SabrePropertyRating?: number;
  public HotelStars?: number;
  public DistanceToTheAirport?: number;
  public FloorsNumber?: number;
  public RoomsNumber?: number;
  public sparklingScore?: number;
  public lastUpdated?: Date;

    // Add association properties
  public scoring?: NonAttribute<HotelScoring>;
  public reviews?: NonAttribute<Review[]>;
  public managers?: NonAttribute<HotelManager[]>;

  // Static association declarations
  public static associations: {
    scoring: Association<Hotel, HotelScoring>;
    reviews: Association<Hotel, Review>;
    managers: Association<Hotel, HotelManager>;
  }
}

Hotel.init({
  GlobalPropertyID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  GlobalPropertyName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  PropertyAddress1: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  CityID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  PropertyStateProvinceID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  PropertyLatitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  PropertyLongitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  SabrePropertyRating: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
  },
  HotelStars: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  DistanceToTheAirport: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  FloorsNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  RoomsNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  sparklingScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'sparkling_score',
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_updated',
  },
}, {
  sequelize,
  modelName: 'Hotel',
  tableName: 'hotels',
  timestamps: false,
});

export default Hotel;
