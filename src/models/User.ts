import {
  DataTypes,
  Model,
  Optional,
  Association,
  NonAttribute
} from 'sequelize';
import sequelize from '../config/database';
import { Role, Review, HotelManager } from './index';

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  nationality?: string;
  roleId?: number;
  accountStatus?: string;
  emailVerified: boolean;
  reviewCount: number;
  createdAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'emailVerified' | 'reviewCount' | 'createdAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public passwordHash!: string;
  public firstName?: string;
  public lastName?: string;
  public nationality?: string;
  public roleId?: number;
  public accountStatus?: string;
  public emailVerified!: boolean;
  public reviewCount!: number;
  public createdAt!: Date;

  // Associations
  public role?: NonAttribute<Role>;
  public reviews?: NonAttribute<Review[]>;
  public managedHotels?: NonAttribute<HotelManager[]>;

  public static associations: {
    role: Association<User, Role>;
    reviews: Association<User, Review>;
    managedHotels: Association<User, HotelManager>;
  };

  public async comparePassword(password: string): Promise<boolean> {
    return password === this.passwordHash;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'last_name'
    },
    nationality: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'role_id',
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    accountStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'active',
      field: 'account_status'
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'email_verified'
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'review_count'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
    // No hooks
  }
);

export default User;
