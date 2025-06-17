import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  development: any;
  test: any;
  production: any;
}

const databaseConfig: DatabaseConfig = {
  development: {
    database: process.env.DB_NAME || 'hotel_sparkling_awards_system',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    database: process.env.TEST_DB_NAME || 'hotel_awards_test',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false
  },
  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    ssl: process.env.NODE_ENV === 'production'
  }
};

const env = process.env.NODE_ENV || 'development';
const config = databaseConfig[env as keyof DatabaseConfig];

const sequelize = new Sequelize(config);

export default sequelize;
export { databaseConfig };
