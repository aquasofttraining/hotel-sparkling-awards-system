import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hotel Sparkling Awards API is running!');
});

// DB connection and sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database.');

    // You can use { force: true } to reset the DB or { alter: true } to apply schema changes
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();
