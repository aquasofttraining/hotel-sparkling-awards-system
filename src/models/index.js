import sequelize from '../config/database.js';

import User from './User.js';
import Role from './Role.js';
import Permission from './Permission.js';
import RolePermission from './RolePermission.js';
import Review from './Review.js';
import ReviewCategory from './ReviewCategory.js';
import ReviewRating from './ReviewRating.js';

// Relații între modele
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
});

Review.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Review, { foreignKey: 'user_id' });

Review.hasMany(ReviewRating, { foreignKey: 'review_id' });
ReviewRating.belongsTo(Review, { foreignKey: 'review_id' });

ReviewCategory.hasMany(ReviewRating, { foreignKey: 'category_id' });
ReviewRating.belongsTo(ReviewCategory, { foreignKey: 'category_id' });

// Exportă tot
export {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Review,
  ReviewCategory,
  ReviewRating
};
