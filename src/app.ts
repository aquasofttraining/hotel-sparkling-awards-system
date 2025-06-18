import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database';

// 🔻 RUTE IMPORTATE
import authRoutes from './routes/auth_routes';
import userRoutes from './routes/users';
import hotelRoutes from './routes/hotels';
import reviewRoutes from './routes/reviews';
import scoringRoutes from './routes/scoring';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🔻 MOUNT ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/scoring', scoringRoutes);

// Test root
app.get('/', (req: Request, res: Response) => {
  res.send('Hotel Sparkling Awards API is running!');
});

// DB connection and sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database.');

    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();
