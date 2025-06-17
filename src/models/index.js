import sequelize from '../config/database.js';

import User from './User.js';
import Role from './Role.js';
import Permission from './Permission.js';
import RolePermission from './RolePermission.js';
import Review from './Review.js';
import ReviewRating from './ReviewRating.js';
import HotelManager from './HotelManager.js';

// Model relationships

// Each Role has many Users
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// Many-to-many: Roles ↔ Permissions through RolePermission
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
});

// User has many Reviews
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// Review has many Ratings
Review.hasMany(ReviewRating, { foreignKey: 'review_id' });
ReviewRating.belongsTo(Review, { foreignKey: 'review_id' });


HotelManager.belongsTo(User, { as: 'assigner', foreignKey: 'assigned_by' });


// Export all models and Sequelize instance
export {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Review,
  ReviewRating
};
