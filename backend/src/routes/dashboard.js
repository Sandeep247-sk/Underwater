import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getDashboardSummary } from '../services/dataStore.js';

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

export default router;
