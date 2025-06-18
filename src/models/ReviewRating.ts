import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ReviewRatingAttributes {
  id: number;
  review_id: number;
  category_id: number;
  rating_value: number;
  created_at?: Date;
}

interface ReviewRatingCreationAttributes
  extends Optional<ReviewRatingAttributes, 'id' | 'created_at'> {}

class ReviewRating
  extends Model<ReviewRatingAttributes, ReviewRatingCreationAttributes>
  implements ReviewRatingAttributes
{
  public id!: number;
  public review_id!: number;
  public category_id!: number;
  public rating_value!: number;
  public created_at?: Date;
}

ReviewRating.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    review_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reviews',
        key: 'id',
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'review_categories',
        key: 'id',
      },
    },
    rating_value: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      validate: {
        min: 1.0,
        max: 5.0,
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ReviewRating',
    tableName: 'review_ratings',
    timestamps: false,
  }
);

export default ReviewRating;
