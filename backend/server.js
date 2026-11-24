
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Validate required environment configuration
if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not configured. Add it to backend/.env'
  );
}

// Security headers
app.use(helmet());

// Restrict cross-origin requests
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

// Limit incoming JSON request size
app.use(express.json({
  limit: '20kb'
}));

// Authentication rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication requests. Please try again later.'
  }
});

// Event API rate limiter
const eventLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many event requests. Please try again later.'
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'EventHub API'
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventLimiter, eventRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error('Request failed:', err.message);

  res.status(err.status || 500).json({
    message: err.status
      ? err.message
      : 'Internal server error'
  });
});

// Connect database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `EventHub API running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      'Database connection failed:',
      error.message
    );

    process.exit(1);
  });
