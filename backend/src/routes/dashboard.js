import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getDashboardSummary, getStationsByStatus } from '../services/dataStore.js';

const router = express.Router();
router.use(authenticate);

// GET /dashboard/summary – KPIs and 30-day trend for dashboard
router.get('/summary', (req, res, next) => {
  try {
    const summary = getDashboardSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// GET /dashboard/stations-by-status?status=critical|warning|normal
router.get('/stations-by-status', (req, res, next) => {
  try {
    const status = req.query.status || 'critical';
    if (!['normal', 'warning', 'critical'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use normal, warning, or critical.' });
    }
    const stations = getStationsByStatus(status);
    res.json({ stations, total: stations.length, status });
  } catch (err) {
    next(err);
  }
});

export default router;
