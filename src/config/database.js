import { Sequelize } from 'sequelize';
import dotenv from 'dotenv'; // ✅ schimbă din require în import

dotenv.config();

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST = 'localhost', DB_PORT = '5432' } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
