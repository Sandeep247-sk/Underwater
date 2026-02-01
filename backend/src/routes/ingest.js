import express from 'express';
import Joi from 'joi';
import { authenticate } from '../middlewares/auth.js';
import { addReadings } from '../services/dataStore.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

const ingestSchema = Joi.object({
  stationId: Joi.string().required(),
  readings: Joi.array().items(
    Joi.object({
      ts: Joi.string().isoDate().required(),
      level: Joi.number().required(),
      qc: Joi.string().valid('OK', 'WARNING', 'ERROR').default('OK')
    })
  ).min(1).required()
});

// POST /ingest
router.post('/', (req, res, next) => {
  try {
    const { error, value } = ingestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { stationId, readings } = value;
    const result = addReadings(stationId, readings);

    res.json({
      stationId,
      inserted: result.inserted,
      rejected: result.rejected,
      errors: result.errors,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

export default router;
