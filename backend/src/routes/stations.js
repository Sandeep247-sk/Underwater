import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getAllStations,
  getStationById,
  getLatestReading,
  getTimeSeries,
  classifyLevel
} from '../services/dataStore.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /stations
router.get('/', (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const { state, district, status } = req.query;

    const filters = {};
    if (state) filters.state = state;
    if (district) filters.district = district;
    if (status) filters.status = status;

    const allStations = getAllStations(filters);
    const total = allStations.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedStations = allStations.slice(start, end);

    const stationsWithStatus = paginatedStations.map(station => {
      const latest = getLatestReading(station.id);
      const status = latest ? classifyLevel(latest.level, station) : 'unknown';
      return {
        id: station.id,
        name: station.name,
        state: station.state,
        district: station.district,
        lat: station.lat,
        lon: station.lon,
        status,
        latestLevel: latest ? latest.level : null,
        lastSeen: latest ? latest.ts : null
      };
    });

    res.json({
      page,
      limit,
      total,
      stations: stationsWithStatus
    });
  } catch (err) {
    next(err);
  }
});

// GET /stations/:id
router.get('/:id', (req, res, next) => {
  try {
    const station = getStationById(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const latest = getLatestReading(station.id);
    const status = latest ? classifyLevel(latest.level, station) : 'unknown';

    res.json({
      id: station.id,
      name: station.name,
      state: station.state,
      district: station.district,
      lat: station.lat,
      lon: station.lon,
      elevation: station.elevation,
      metadata: station.metadata,
      normalThreshold: station.normalThreshold,
      warningThreshold: station.warningThreshold,
      criticalThreshold: station.criticalThreshold,
      status,
      latestLevel: latest ? latest.level : null,
      lastSeen: latest ? latest.ts : null,
      createdAt: station.createdAt
    });
  } catch (err) {
    next(err);
  }
});

// GET /stations/:id/timeseries
router.get('/:id/timeseries', (req, res, next) => {
  try {
    const station = getStationById(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = req.query.to ? new Date(req.query.to) : new Date();
    const interval = req.query.interval || 'daily';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;

    const series = getTimeSeries(station.id, from, to, interval);
    const total = series.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedSeries = series.slice(start, end);

    // Calculate aggregates
    const levels = series.map(s => s.level);
    const avgLevel = levels.length > 0 ? levels.reduce((a, b) => a + b, 0) / levels.length : 0;
    const minLevel = levels.length > 0 ? Math.min(...levels) : 0;
    const maxLevel = levels.length > 0 ? Math.max(...levels) : 0;

    res.json({
      stationId: station.id,
      from: from.toISOString(),
      to: to.toISOString(),
      interval,
      page,
      limit,
      total,
      data: paginatedSeries,
      aggregates: {
        avgLevel: parseFloat(avgLevel.toFixed(2)),
        minLevel: parseFloat(minLevel.toFixed(2)),
        maxLevel: parseFloat(maxLevel.toFixed(2)),
        count: series.length
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
