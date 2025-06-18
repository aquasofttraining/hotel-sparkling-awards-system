import sequelize from '../config/database';

import User from './User';
import Role from './Role';
import Permission from './Permission';
import RolePermission from './RolePermission';
import Review from './Review';
import ReviewRating from './ReviewRating';
import HotelManager from './HotelManager';
import Hotel from './Hotel';
import HotelScoring from './HotelScoring';

// ----------------------
// Model Associations
// ----------------------

// Role <-> User (1:N)
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// Role <-> Permission (M:N) via RolePermission
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
});

// User <-> Review (1:N)
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });




// Review <-> ReviewRating (1:N)
Review.hasMany(ReviewRating, { foreignKey: 'review_id' });
ReviewRating.belongsTo(Review, { foreignKey: 'review_id' });

// HotelManager ↔ User (assigner relationship)
HotelManager.belongsTo(User, {
  as: 'assigner',
  foreignKey: 'assigned_by',
});

// Hotel <-> Review (1:N)
Hotel.hasMany(Review, { foreignKey: 'hotel_id', as: 'reviews' });
Review.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });

// Hotel <-> HotelManager (1:N)
Hotel.hasMany(HotelManager, { foreignKey: 'hotel_id' });
HotelManager.belongsTo(Hotel, { foreignKey: 'hotel_id' });

// Hotel <-> HotelScoring (1:1)
Hotel.hasOne(HotelScoring, {
  foreignKey: 'hotel_id',
  as: 'scoring' // 👈 acest alias trebuie să fie aici ca să funcționeze include-ul
});
HotelScoring.belongsTo(Hotel, {
  foreignKey: 'hotel_id',
  as: 'hotel' // acest alias nu e obligatoriu, dar e util dacă vrei acces de la HotelScoring spre Hotel
});

// ----------------------
// Export everything
// ----------------------
export {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Review,
  ReviewRating,
  HotelManager,
  Hotel,
  HotelScoring,
};
