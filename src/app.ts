// src/app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database'; // Remove .js extension
import authRoutes from './routes/auth_routes';
import userRoutes from './routes/users';
import hotelRoutes from './routes/hotels';
import reviewRoutes from './routes/reviews';
import scoringRoutes from './routes/scoring';

console.log('🚀 App starting...');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req: Request, res: Response) => {
  console.log('🏠 Home route hit');
  res.send('Hotel Sparkling Awards API is running!');
});

console.log('📦 Importing routes...');

try {
  
  console.log('✅ Routes imported successfully');
  
  console.log('🔧 Registering routes...');
  app.use('/api/hotels', (req, res, next) => {
  console.log('🏨 Hotel API Request:', {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers.authorization ? 'Present' : 'Missing'
  });
  next();
});
  // Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/scoring', scoringRoutes);
  console.log('✅ All routes registered');


// Add this AFTER all your routes in app.ts
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ CRITICAL SERVER ERROR:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    sql: err.sql,
    parameters: err.parameters,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.user
  });
  
  res.status(500).json({ 
    success: false, 
    message: 'Failed to create hotel',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      type: err.name,
      sql: err.sql
    } : 'Internal server error'
  });
});

  
} catch (error) {
  console.error('❌ Error importing routes:', error);
}

app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database.');
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('🔧 Available routes:');
      console.log('   - GET /');
      console.log('   - GET /api/hotels/debug/auth');
    });
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();

console.log('authRoutes:', authRoutes);
console.log('userRoutes:', userRoutes);
console.log('hotelRoutes:', hotelRoutes);
console.log('reviewRoutes:', reviewRoutes);
console.log('scoringRoutes:', scoringRoutes);
