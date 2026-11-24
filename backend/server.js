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

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured. Add it to backend/.env');
}

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'EventHub API' }));
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('Request failed:', err.message);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Internal server error' });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`EventHub API running on http://localhost:${PORT}`));
}).catch((error) => {
  console.error('Database connection failed:', error.message);
  process.exit(1);
});
