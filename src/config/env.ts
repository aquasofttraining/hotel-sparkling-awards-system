import dotenv from 'dotenv';
dotenv.config();

interface DatabaseConfig {
  database: string;
  username: string;
  password: string;
  host: string;
  port: number;
  dialect: 'postgres';
  logging: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  dialectOptions: any;
}

interface EnvConfig {
  port: number;
  jwtSecret: string;
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
  database: DatabaseConfig;
}

const envConfig: EnvConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  database: {
    database: process.env.DB_NAME || 'hotel_sparkling_awards_system',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: process.env.NODE_ENV === 'production' 
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}
  }
};

export default envConfig;
