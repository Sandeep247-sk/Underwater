
import { getLatestReading, getStationById, getTimeSeries } from './dataStore.js';

/**
 * @typedef {Object} ForecastResult
 * @property {string} stationId
 * @property {number} forecastHorizonDays
 * @property {string} trend
 * @property {number} predictedLevelChange
 * @property {string} riskLevel
 * @property {string} alertTrigger
 * @property {number} confidenceScore
 * @property {string} conservationRecommendation
 * @property {Array<{ts: string, level: number, type: string}>} predictedTimeSeries
 */

/**
 * Generates groundwater level predictions for a given station.
 * @param {string} stationId
 * @param {number} horizonDays - 30, 60, 90
 * @returns {ForecastResult}
 */
export function generateForecast(stationId, horizonDays = 30) {
    const station = getStationById(stationId);
    if (!station) {
        throw new Error(`Station ${stationId} not found`);
    }

    // 1. Get Historical Data (Last 90 days for better trend analysis)
    const now = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(now.getDate() - 90);
    
    // We use daily average for prediction to smooth out intraday fluctuations
    const history = getTimeSeries(stationId, ninetyDaysAgo, now, 'daily');
    
    if (history.length < 5) {
        return {
            stationId,
            forecastHorizonDays: horizonDays,
            trend: 'Unknown',
            predictedLevelChange: 0,
            riskLevel: 'Unknown',
            alertTrigger: 'No',
            confidenceScore: 0,
            conservationRecommendation: 'Insufficient data for prediction.',
            predictedTimeSeries: []
        };
    }

    // 2. Trend Analysis (Linear Regression)
    const { slope, intercept, rSquared } = calculateLinearRegression(history);
    
    // 3. Generate Forecast Points
    const predictedTimeSeries = [];
    let lastDate = new Date(history[history.length - 1].ts);
    
    for (let i = 1; i <= horizonDays; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + i);
        
        // Simple linear projection: y = mx + c
        // x is days from start of history
        // We need to map nextDate to the x-axis used in regression
        const daysFromStart = (nextDate - new Date(history[0].ts)) / (1000 * 60 * 60 * 24);
        const predictedLevel = (slope * daysFromStart) + intercept;
        
        predictedTimeSeries.push({
            ts: nextDate.toISOString(),
            level: parseFloat(predictedLevel.toFixed(2)),
            type: 'predicted'
        });
    }

    const currentLevel = history[history.length - 1].level;
    const finalPredictedLevel = predictedTimeSeries[predictedTimeSeries.length - 1].level;
    const predictedChange = parseFloat((finalPredictedLevel - currentLevel).toFixed(2));

    // 4. Classify Trend
    let trend = 'Stable';
    if (predictedChange > 0.5) trend = 'Rising'; // Threshold for significant change
    else if (predictedChange < -0.5) trend = 'Declining';

    // 5. Risk Assessment
    const risk = assessRisk(finalPredictedLevel, station);
    const alertTrigger = (finalPredictedLevel < station.criticalThreshold || risk === 'Critical Risk') ? 'Yes' : 'No';

    // 6. Confidence Score
    // Simplified confidence based on data points and R-squared
    let confidence = Math.min(Math.round(rSquared * 100), 100);
    if (history.length < 30) confidence *= 0.8; // Penalize for short history
    // Cap at 95% because it's a prediction
    confidence = Math.min(confidence, 95);

    // 7. Recommendations
    const recommendation = generateRecommendation(trend, station);

    return {
        stationId,
        forecastHorizon: `${horizonDays} Days`,
        trendClassification: trend,
        predictedLevelChange: `${predictedChange} m`,
        riskLevel: risk,
        alertTrigger: alertTrigger === 'Yes' ? `⚠️ Predicted groundwater depletion risk detected within the next ${horizonDays} days.` : 'No',
        confidenceScore: `${confidence}%`,
        conservationRecommendation: `Suggested Action: ${recommendation}`,
        predictedTimeSeries,
        systemNote: "Forecast Data — Experimental Overlay"
    };
}

function calculateLinearRegression(data) {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    // x = days since start, y = level
    const startTime = new Date(data[0].ts).getTime();

    for (let i = 0; i < n; i++) {
        const x = (new Date(data[i].ts).getTime() - startTime) / (1000 * 60 * 60 * 24);
        const y = data[i].level;
        
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
        sumYY += y * y;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const rNumerator = (n * sumXY - sumX * sumY);
    const rDenominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    const r = rDenominator === 0 ? 0 : rNumerator / rDenominator;

    return { slope, intercept, rSquared: r * r };
}

function assessRisk(predictedLevel, station) {
    if (predictedLevel < station.criticalThreshold) return 'Critical Risk';
    if (predictedLevel < station.warningThreshold) return 'Moderate Risk';
    return 'Low Risk';
}

function generateRecommendation(trend, station) {
    if (trend === 'Declining') {
        return 'Reduce groundwater pumping, Implement artificial recharge structures, Promote rainwater harvesting';
    } else if (trend === 'Stable') {
        return 'Maintain regulated extraction, Continue monitoring recharge patterns';
    } else {
        return 'Encourage storage and sustainable usage planning';
    }
}

// Simulation Support
export function simulateScenario(stationId, scenarioType) {
    const baseForecast = generateForecast(stationId, 30);
    
    // Simple heuristic adjustments for demonstration
    let modificationFactor = 1.0;
    let scenarioNote = '';

    switch (scenarioType) {
        case 'increased_pumping':
            modificationFactor = 0.95; // Levels drop faster
            scenarioNote = 'Scenario: Increased Pumping Rate';
            break;
        case 'reduced_rainfall':
            modificationFactor = 0.98; // Slightly lower recharge
            scenarioNote = 'Scenario: Reduced Rainfall';
            break;
        case 'conservation':
            modificationFactor = 1.05; // Levels improve
            scenarioNote = 'Scenario: Conservation Measures Implemented';
            break;
        default:
            return baseForecast;
    }

    // Apply modification to predicted series and re-evaluate
    baseForecast.predictedTimeSeries = baseForecast.predictedTimeSeries.map(pt => ({
        ...pt,
        level: parseFloat((pt.level * modificationFactor).toFixed(2))
    }));

    // Recalculate end metrics based on modified series
    const finalLevel = baseForecast.predictedTimeSeries[baseForecast.predictedTimeSeries.length - 1].level;
    const station = getStationById(stationId); // Need to fetch again for thresholds
    
    if (station) {
        const risk = assessRisk(finalLevel, station);
         baseForecast.riskLevel = risk;
         if (finalLevel < station.criticalThreshold || risk === 'Critical Risk') {
             baseForecast.alertTrigger =  `⚠️ Predicted groundwater depletion risk detected within the next 30 days.`;
         } else {
             baseForecast.alertTrigger = 'No';
         }
    }
    
    baseForecast.systemNote += ` | ${scenarioNote}`;
    
    return baseForecast;
}
