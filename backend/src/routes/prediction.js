
import express from 'express';
import { generateForecast, simulateScenario } from '../services/predictionService.js';

const router = express.Router();

// GET /api/prediction/forecast/:stationId?horizon=30
router.get('/forecast/:stationId', (req, res) => {
    try {
        const { stationId } = req.params;
        const horizon = parseInt(req.query.horizon) || 30;
        
        const forecast = generateForecast(stationId, horizon);
        res.json(forecast);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// GET /api/prediction/simulate/:stationId?scenario=increased_pumping
router.get('/simulate/:stationId', (req, res) => {
    try {
        const { stationId } = req.params;
        const scenario = req.query.scenario; // increased_pumping, reduced_rainfall, conservation
        
        if (!scenario) {
            return res.status(400).json({ error: 'Scenario query parameter is required' });
        }

        const simulation = simulateScenario(stationId, scenario);
        res.json(simulation);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;
