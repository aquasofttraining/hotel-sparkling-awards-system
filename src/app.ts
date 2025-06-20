import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';

console.log(' App starting...');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(` ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req: Request, res: Response) => {
  console.log('Home route hit');
  res.send('Hotel Sparkling Awards API is running!');
});

console.log('Importing routes...');

try {
  const authRoutes = require('./routes/auth_routes');
  const userRoutes = require('./routes/users');
  const hotelRoutes = require('./routes/hotels');
  const reviewRoutes = require('./routes/reviews');
  const scoringRoutes = require('./routes/scoring');
  const userManagementRoutes = require('./routes/userManagementRoutes') //  Add user management routes
  
  console.log(' Routes imported successfully');
  
  console.log('🔧 Registering routes...');
  
  // Hotel API debug middleware
  app.use('/api/hotels', (req, res, next) => {
    console.log(' Hotel API Request:', {
      method: req.method,
      url: req.url,
      body: req.body,
      headers: req.headers.authorization ? 'Present' : 'Missing'
    });
    next();
  });

  //  Register all routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/hotels', hotelRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/scoring', scoringRoutes);
  app.use('/api/user-management', userManagementRoutes); //  Add user management routes
  
  console.log(' All routes registered');

  // Error handling middleware - AFTER all routes
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(' CRITICAL SERVER ERROR:', {
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
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        type: err.name,
        sql: err.sql
      } : 'Internal server error'
    });
  });

} catch (error) {
  console.error(' Error importing routes:', error);
}

// 404 handler - MUST be last
app.use('*', (req, res) => {
  console.log(` 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log(' Connected to the database.');
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(` Server is running on http://localhost:${PORT}`);
      console.log(' Available routes:');
      console.log('   - GET  /');
      console.log('   - POST /api/auth/login');
      console.log('   - POST /api/auth/logout');
      console.log('   - GET  /api/auth/profile');
      console.log('   - GET  /api/hotels');
      console.log('   - GET  /api/hotels/:id');
      console.log('   - GET  /api/hotels/debug/auth');
      console.log('   - GET  /api/scoring');
      console.log('   - POST /api/scoring/calculate/:hotelId');
      console.log('   - GET  /api/user-management/users'); //  Add user management routes
      console.log('   - POST /api/user-management/users');
      console.log('   - PUT  /api/user-management/users/:userId');
      console.log('   - DELETE /api/user-management/users/:userId');
      console.log('   - GET  /api/user-management/roles');
      console.log('   - GET  /api/user-management/hotels');
      console.log(' User Management available at: /api/user-management/*');
    });
  } catch (err) {
    console.error(' Database connection failed:', err);
  }
})();
