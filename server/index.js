import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDb } from './config/database.js';
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import deviceRoutes from './routes/devices.js';
import usageRoutes from './routes/usage.js';
import calcRoutes from './routes/calc.js';
import historyRoutes from './routes/history.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Fact Electricity API — Madagascar JIRAMA Tariff Simulator',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      devices: '/api/devices',
      usage: '/api/usage',
      calc: '/api/calc',
      history: '/api/history',
      settings: '/api/settings',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/devices', authenticateToken, deviceRoutes);
app.use('/api/usage', authenticateToken, usageRoutes);
app.use('/api/calc', authenticateToken, calcRoutes);
app.use('/api/history', authenticateToken, historyRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await initDb();
    console.log('✅ Database initialized');

    app.listen(PORT, () => {
      console.log(`🚀 Fact Electricity API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
