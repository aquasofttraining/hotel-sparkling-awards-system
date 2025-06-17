import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Exemplu: ruta basic
app.get('/', (req, res) => {
  res.send('Hotel Sparkling Awards API is running!');
});

// Conectare și sincronizare DB
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database.');

    // Sincronizează modelele (opțional: { force: true } pentru reset DB)
    await sequelize.sync(); // sau: await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();
