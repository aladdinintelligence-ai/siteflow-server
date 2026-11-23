import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { initSocketIO } from './socket/index.js';
import { errorHandler } from './middleware/errorHandler.js';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Connect MongoDB
connectDB();

// Initialize Socket.io
const io = initSocketIO(server);

// Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads directory for proof photos and dockets
const uploadPath = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'DJ Civil SiteFlow Backend',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SiteFlow Server] Running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
  console.log(`[SiteFlow Server] Socket.io listening for client connections`);
});

export { app, server, io };

