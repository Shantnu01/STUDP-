// src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { initFirebase } from './lib/firebase.js';
import schoolsRouter   from './routes/schools.js';
import paymentsRouter  from './routes/payments.js';
import requestsRouter  from './routes/requests.js';
import messagesRouter  from './routes/messages.js';
import analyticsRouter from './routes/analytics.js';
import attendanceRouter from './routes/attendance.js';

// ── Init Firebase Admin ────────────────────────────────────────────────────────
initFirebase();

// ── Express App ───────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, process.env.FRONTEND_URL || 'http://localhost:5173');
    }
  },
  credentials: true,
}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/schools',   schoolsRouter);
app.use('/api/payments',  paymentsRouter);
app.use('/api/requests',  requestsRouter);
app.use('/api/messages',  messagesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/attendance', attendanceRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 EduSync backend listening on http://localhost:${PORT}`);
});
