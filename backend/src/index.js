import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import stationRoutes from './routes/stations.js';
import ingestRoutes from './routes/ingest.js';
import dashboardRoutes from './routes/dashboard.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { initializeDataStore } from './services/dataStore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for prototype
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize in-memory data store with sample data
initializeDataStore();

// Serve static frontend files
const frontendPath = join(__dirname, '../../frontend/public');
app.use(express.static(frontendPath));

// API routes
app.use('/auth', authRoutes);
app.use('/stations', stationRoutes);
app.use('/ingest', ingestRoutes);
app.use('/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Export for Vercel
export default app;

// Only listen if run directly (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Network: 0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
