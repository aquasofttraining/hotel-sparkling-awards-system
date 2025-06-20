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
  autoIncrement: true,
  field: 'globalpropertyid', // 👈 Asta lipsea
  },

  GlobalPropertyName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'globalpropertyname', // 👈 Asta lipsea
  },
  PropertyAddress1: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'propertyaddress1', // 👈 Asta lipsea
  },
  CityID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'cityid', // 👈 Asta lipsea
  },
  PropertyStateProvinceID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'propertystateprovinceid', // 👈 Asta lipsea
  },
  PropertyLatitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'propertylatitude', // 👈 Asta lipsea
  },
  PropertyLongitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'propertylongitude', // 👈 Asta lipsea
  },
  SabrePropertyRating: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    field: 'sabrepropertyrating', // 👈 Asta lipsea
  },
  HotelStars: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'hotelstars', // 👈 Asta lipsea
  },
  DistanceToTheAirport: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'distancetotheairport', // 👈 Asta lipsea
  },
  FloorsNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'floorsnumber', // 👈 Asta lipsea
  },
  RoomsNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'roomsnumber', // 👈 Asta lipsea
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
