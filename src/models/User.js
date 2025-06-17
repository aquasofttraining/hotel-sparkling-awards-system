import  { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  nationality: {
    type: DataTypes.STRING(50),
  },
  role_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'roles', // Numele tabelului din baza de date
      key: 'id',
    }
  }
}, {
  tableName: 'users',
  timestamps: false,
});


export default User;
