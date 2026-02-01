#!/usr/bin/env node
/**
 * Sample ingestion script for testing the /ingest endpoint
 * Usage: node scripts/sample-ingest.js [stationId]
 */

import fetch from 'node-fetch';

const API_BASE = process.env.API_URL || 'http://localhost:3000';
const TOKEN = process.env.JWT_TOKEN || '';

// Get station ID from command line or use default
const stationId = process.argv[2] || 'DWLR_001';

// Generate sample readings for the last 24 hours (every 15 minutes)
const readings = [];
const now = new Date();
for (let i = 0; i < 96; i++) {
  const ts = new Date(now);
  ts.setMinutes(ts.getMinutes() - (96 - i) * 15);
  const baseLevel = 12.0;
  const level = baseLevel + (Math.random() - 0.5) * 2;
  
  readings.push({
    ts: ts.toISOString(),
    level: parseFloat(level.toFixed(2)),
    qc: 'OK'
  });
}

async function ingest() {
  try {
    const response = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        stationId,
        readings
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Ingestion failed:', result);
      process.exit(1);
    }

    console.log('Ingestion successful:');
    console.log(`  Station: ${stationId}`);
    console.log(`  Inserted: ${result.inserted}`);
    console.log(`  Rejected: ${result.rejected}`);
    if (result.errors && result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.length}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

ingest();
