// src/models/index.ts
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
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// Role <-> Permission (M:N) via RolePermission
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  as: 'permissions'
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  as: 'roles'
});

// User <-> Review (1:N)
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> HotelManager (1:N) - User can be assigned to manage multiple hotels
User.hasMany(HotelManager, { foreignKey: 'user_id', as: 'managedHotels' });
HotelManager.belongsTo(User, { foreignKey: 'user_id', as: 'manager' });

// User <-> HotelManager (assigner relationship) - Who assigned the manager
User.hasMany(HotelManager, { foreignKey: 'assigned_by', as: 'assignedManagers' });
HotelManager.belongsTo(User, { foreignKey: 'assigned_by', as: 'assigner' });

// Hotel <-> Review (1:N)
Hotel.hasMany(Review, { foreignKey: 'hotel_id', as: 'reviews' });
Review.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });

// Hotel <-> HotelManager (1:N)
Hotel.hasMany(HotelManager, { foreignKey: 'hotel_id', as: 'managers' });
HotelManager.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });

// Hotel <-> HotelScoring (1:1)
Hotel.hasOne(HotelScoring, {
  foreignKey: 'hotel_id',
  as: 'scoring'
});
HotelScoring.belongsTo(Hotel, {
  foreignKey: 'hotel_id',
  as: 'hotel'
});

// Review <-> ReviewRating (1:N)
Review.hasMany(ReviewRating, { foreignKey: 'review_id', as: 'ratings' });
ReviewRating.belongsTo(Review, { foreignKey: 'review_id', as: 'review' });

// ----------------------
// Sync database (optional - useful for development)
// ----------------------
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync all models - be careful with this in production
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false }); // Set to true only if you want to alter existing tables
      console.log('✅ All models synchronized successfully.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

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
  initializeDatabase
};

export default sequelize;
