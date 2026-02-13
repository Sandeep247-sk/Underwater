
import fs from 'fs';
import { initializeDataStore, getAllStations } from '../backend/src/services/dataStore.js';
import { generateForecast, simulateScenario } from '../backend/src/services/predictionService.js';

// Initialize data
initializeDataStore();

const output = [];
const log = (msg) => output.push(msg);

// Get a random station to test
const stations = getAllStations();
const stationId = stations[0].id;

log(`Testing Prediction for Station: ${stationId} (${stations[0].name})`);

// Test Forecast Generation
try {
    const forecast = generateForecast(stationId, 30);
    log('--- Forecast Result ---');
    log(JSON.stringify(forecast, null, 2));

    // Basic Validation
    if (!forecast.stationId || !forecast.forecastHorizon || !forecast.trendClassification) {
        log('FAILED: Missing required fields in forecast result.');
    } else {
        log('PASSED: Forecast structure seems correct.');
    }

} catch (error) {
    log(`Error generating forecast: ${error.message}`);
}

// Test Simulation Scenario
try {
    log('\n--- Simulation Scenario: Increased Pumping ---');
    const simulation = simulateScenario(stationId, 'increased_pumping');
    log(JSON.stringify(simulation, null, 2));
} catch (error) {
    log(`Error simulating scenario: ${error.message}`);
}

fs.writeFileSync('test_output_clean.txt', output.join('\n'));
console.log('Test complete. Output written to test_output_clean.txt');
