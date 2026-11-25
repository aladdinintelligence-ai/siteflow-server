import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { initSocketIO } from './socket/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { User } from './models/User.js';
import { runSeed } from './seed.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import gateRoutes from './routes/gateRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import exitRoutes from './routes/exitRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocketIO(server);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads directory for proof photos and dockets
const uploadPath = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadPath));

// Health check endpoint with database diagnostics
app.get('/api/health', async (req, res) => {
  let userCount = 0;
  try {
    userCount = await User.countDocuments();
  } catch {}

  res.json({
    status: 'online',
    system: 'DJ Civil SiteFlow Backend',
    version: '1.0.0',
    database: {
      connected: mongoose.connection.readyState === 1,
      userCount,
      initialized: userCount > 0,
    },
    time: new Date().toISOString(),
  });
});

// Explicit seed endpoint to initialize or reset database remotely (Render/Production)
app.all(['/api/seed', '/api/auth/seed'], async (req, res) => {
  try {
    console.log('[API] Database seed triggered via /api/seed');
    await runSeed();
    const userCount = await User.countDocuments();
    res.json({
      success: true,
      message: 'DJ Civil SiteFlow database seeded successfully',
      seededUsersCount: userCount,
      accounts: [
        { role: 'manager', email: 'chris.jones@djcivil.co.uk', name: 'Chris Jones' },
        { role: 'supplier', email: 'dispatch@cemex.co.uk', name: 'Marcus Bell' },
        { role: 'driver', email: 'dave.miller@cemex.co.uk', name: 'Dave Miller' },
        { role: 'marshal', email: 'gate1.marshal@djcivil.co.uk', name: "Gary O'Connor" },
        { role: 'analyst', email: 'analyst@djcivil.co.uk', name: 'Emma Richardson' },
      ],
      defaultPassword: 'SiteFlow2026!',
    });
  } catch (err: any) {
    console.error('[API Seed Error]', err);
    res.status(500).json({ success: false, message: err?.message || 'Database seed failed' });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/gate', gateRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/exit', exitRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server after connecting and ensuring initial seed data
async function startServer() {
  await connectDB();

  // Auto-seed if database is fresh / empty (e.g. Render, Atlas, production deploy)
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] 0 users found on startup. Auto-seeding production database...');
      await runSeed();
      console.log('[Database] Auto-seeding completed successfully.');
    } else {
      console.log(`[Database] Found ${userCount} existing users. Seed check passed.`);
    }
  } catch (seedErr) {
    console.error('[Database] Auto-seed check warning:', seedErr);
  }

  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`[SiteFlow Server] Running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
    console.log(`[SiteFlow Server] Socket.io listening for client connections`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Fatal Error]', err);
});

export { app, server, io };
