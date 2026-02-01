// In-memory data store for prototype
// In production, replace with PostgreSQL queries

let stations = new Map();
let readings = new Map(); // stationId -> array of readings
let users = new Map();

// Initialize with sample data
export function initializeDataStore() {
  // Sample users
  users.set('researcher', {
    id: '1',
    username: 'researcher',
    passwordHash: '$2a$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', // researcher123
    role: 'Researcher',
    regionRestrictions: null
  });
  users.set('planner', {
    id: '2',
    username: 'planner',
    passwordHash: '$2a$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', // planner123
    role: 'Planner',
    regionRestrictions: null
  });
  users.set('admin', {
    id: '3',
    username: 'admin',
    passwordHash: '$2a$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', // admin123
    role: 'Admin',
    regionRestrictions: null
  });

  // Generate 50+ sample stations across India
  const states = ['Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh'];
  const districts = ['Mumbai', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Bhopal', 'Bangalore', 'Chennai', 'Hyderabad'];
  
  for (let i = 1; i <= 60; i++) {
    const stationId = `DWLR_${String(i).padStart(3, '0')}`;
    const state = states[Math.floor(Math.random() * states.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    
    // India coordinates roughly: 6.5°N to 37°N, 68°E to 97°E
    const lat = 6.5 + Math.random() * 30.5;
    const lon = 68 + Math.random() * 29;
    
    const normalThreshold = 15 + Math.random() * 10;
    const warningThreshold = normalThreshold * 0.7;
    const criticalThreshold = normalThreshold * 0.5;
    
    const station = {
      id: stationId,
      name: `Station ${i} - ${district}`,
      state,
      district,
      lat: parseFloat(lat.toFixed(6)),
      lon: parseFloat(lon.toFixed(6)),
      elevation: Math.floor(50 + Math.random() * 500),
      metadata: {
        installationDate: '2020-01-01',
        sensorType: 'DWLR'
      },
      normalThreshold,
      warningThreshold,
      criticalThreshold,
      createdAt: new Date('2020-01-01').toISOString()
    };
    
    stations.set(stationId, station);
    readings.set(stationId, []);
    
    // Generate sample time-series data for last 30 days
    const now = new Date();
    for (let d = 0; d < 30; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      for (let h = 0; h < 24; h += 6) {
        const ts = new Date(date);
        ts.setHours(h, 0, 0, 0);
        const baseLevel = normalThreshold * (0.6 + Math.random() * 0.4);
        const level = baseLevel + (Math.random() - 0.5) * 2;
        
        readings.get(stationId).push({
          id: `${stationId}_${ts.toISOString()}`,
          stationId,
          ts: ts.toISOString(),
          level: parseFloat(level.toFixed(2)),
          qc: 'OK',
          raw: {}
        });
      }
    }
    
    // Sort readings by timestamp
    readings.get(stationId).sort((a, b) => new Date(a.ts) - new Date(b.ts));
  }

  // Tamil Nadu stations: Namakkal, Erode, Vellore, Chennai (specific locations)
  const tamilNaduStations = [
    // Namakkal district
    { id: 'DWLR_TN_001', name: 'Namakkal - Town', district: 'Namakkal', lat: 11.2290, lon: 78.1662 },
    { id: 'DWLR_TN_002', name: 'Namakkal - Rasipuram', district: 'Namakkal', lat: 11.4600, lon: 78.1800 },
    { id: 'DWLR_TN_003', name: 'Namakkal - Tiruchengode', district: 'Namakkal', lat: 11.3800, lon: 77.8900 },
    { id: 'DWLR_TN_004', name: 'Namakkal - Paramathi', district: 'Namakkal', lat: 11.1000, lon: 78.0500 },
    // Erode district
    { id: 'DWLR_TN_005', name: 'Erode - Town (Brough Road)', district: 'Erode', lat: 11.3410, lon: 77.7172 },
    { id: 'DWLR_TN_006', name: 'Erode - Bhavani', district: 'Erode', lat: 11.4500, lon: 77.6800 },
    { id: 'DWLR_TN_007', name: 'Erode - Perundurai', district: 'Erode', lat: 11.2700, lon: 77.5800 },
    { id: 'DWLR_TN_008', name: 'Erode - Sathyamangalam', district: 'Erode', lat: 11.5100, lon: 77.2400 },
    { id: 'DWLR_TN_009', name: 'Erode - Chennimalai', district: 'Erode', lat: 11.1600, lon: 77.6300 },
    // Vellore district
    { id: 'DWLR_TN_010', name: 'Vellore - Town (Fort)', district: 'Vellore', lat: 12.9165, lon: 79.1325 },
    { id: 'DWLR_TN_011', name: 'Vellore - Katpadi', district: 'Vellore', lat: 12.9800, lon: 79.1400 },
    { id: 'DWLR_TN_012', name: 'Vellore - Gudiyatham', district: 'Vellore', lat: 12.9500, lon: 78.8700 },
    { id: 'DWLR_TN_013', name: 'Vellore - Arcot', district: 'Vellore', lat: 12.9000, lon: 79.3300 },
    { id: 'DWLR_TN_014', name: 'Vellore - Arakkonam', district: 'Vellore', lat: 13.0800, lon: 79.6700 },
    // Chennai district
    { id: 'DWLR_TN_015', name: 'Chennai - Adyar', district: 'Chennai', lat: 13.0100, lon: 80.2600 },
    { id: 'DWLR_TN_016', name: 'Chennai - Anna Nagar', district: 'Chennai', lat: 13.0900, lon: 80.2100 },
    { id: 'DWLR_TN_017', name: 'Chennai - T. Nagar', district: 'Chennai', lat: 13.0400, lon: 80.2300 },
    { id: 'DWLR_TN_018', name: 'Chennai - Ambattur', district: 'Chennai', lat: 13.1000, lon: 80.1600 },
    { id: 'DWLR_TN_019', name: 'Chennai - Guindy', district: 'Chennai', lat: 13.0060, lon: 80.2106 },
    { id: 'DWLR_TN_020', name: 'Chennai - Mylapore', district: 'Chennai', lat: 13.0340, lon: 80.2670 }
  ];
  tamilNaduStations.forEach((s, idx) => {
    const stationId = s.id;
    const normalThreshold = 15 + Math.random() * 10;
    const warningThreshold = normalThreshold * 0.7;
    const criticalThreshold = normalThreshold * 0.5;
    const station = {
      id: stationId,
      name: s.name,
      state: 'Tamil Nadu',
      district: s.district,
      lat: s.lat,
      lon: s.lon,
      elevation: Math.floor(50 + Math.random() * 500),
      metadata: { installationDate: '2020-01-01', sensorType: 'DWLR' },
      normalThreshold,
      warningThreshold,
      criticalThreshold,
      createdAt: new Date('2020-01-01').toISOString()
    };
    stations.set(stationId, station);
    readings.set(stationId, []);
    const now = new Date();
    for (let d = 0; d < 30; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      for (let h = 0; h < 24; h += 6) {
        const ts = new Date(date);
        ts.setHours(h, 0, 0, 0);
        const baseLevel = normalThreshold * (0.6 + Math.random() * 0.4);
        const level = baseLevel + (Math.random() - 0.5) * 2;
        readings.get(stationId).push({
          id: `${stationId}_${ts.toISOString()}`,
          stationId,
          ts: ts.toISOString(),
          level: parseFloat(level.toFixed(2)),
          qc: 'OK',
          raw: {}
        });
      }
    }
    readings.get(stationId).sort((a, b) => new Date(a.ts) - new Date(b.ts));
  });

  // More Tamil Nadu cities (keep Namakkal, Erode, Vellore, Chennai as above)
  const moreTamilNaduStations = [
    { id: 'DWLR_TN_021', name: 'Coimbatore - RS Puram', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
    { id: 'DWLR_TN_022', name: 'Coimbatore - Gandhipuram', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0080, lon: 76.9670 },
    { id: 'DWLR_TN_023', name: 'Madurai - KK Nagar', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198 },
    { id: 'DWLR_TN_024', name: 'Madurai - Tallakulam', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9350, lon: 78.1300 },
    { id: 'DWLR_TN_025', name: 'Salem - Hasthampatti', district: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lon: 78.1460 },
    { id: 'DWLR_TN_026', name: 'Salem - Suramangalam', district: 'Salem', state: 'Tamil Nadu', lat: 11.6500, lon: 78.1600 },
    { id: 'DWLR_TN_027', name: 'Tiruchirappalli - Srirangam', district: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7047 },
    { id: 'DWLR_TN_028', name: 'Tiruchirappalli - Tennur', district: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.8100, lon: 78.6900 },
    { id: 'DWLR_TN_029', name: 'Thanjavur - Town', district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7869, lon: 79.1378 },
    { id: 'DWLR_TN_030', name: 'Tirunelveli - Palayamkottai', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lon: 77.7567 },
    { id: 'DWLR_TN_031', name: 'Dindigul - Natham Road', district: 'Dindigul', state: 'Tamil Nadu', lat: 10.3680, lon: 77.9803 },
    { id: 'DWLR_TN_032', name: 'Kanchipuram - Town', district: 'Kanchipuram', state: 'Tamil Nadu', lat: 12.8342, lon: 79.7036 },
    { id: 'DWLR_TN_033', name: 'Tiruppur - Kumaran Road', district: 'Tiruppur', state: 'Tamil Nadu', lat: 11.1085, lon: 77.3411 },
    { id: 'DWLR_TN_034', name: 'Cuddalore - Town', district: 'Cuddalore', state: 'Tamil Nadu', lat: 11.7560, lon: 79.7543 }
  ];

  // Stations across all Indian states (city, district, state, coords)
  const allIndiaStations = [
    { id: 'DWLR_IN_MH_01', name: 'Mumbai - Andheri', district: 'Mumbai', state: 'Maharashtra', lat: 19.1136, lon: 72.8697 },
    { id: 'DWLR_IN_MH_02', name: 'Pune - Shivajinagar', district: 'Pune', state: 'Maharashtra', lat: 18.5304, lon: 73.8526 },
    { id: 'DWLR_IN_MH_03', name: 'Nagpur - Sitabuldi', district: 'Nagpur', state: 'Maharashtra', lat: 21.1498, lon: 79.0820 },
    { id: 'DWLR_IN_GJ_01', name: 'Ahmedabad - SG Highway', district: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
    { id: 'DWLR_IN_GJ_02', name: 'Vadodara - Alkapuri', district: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
    { id: 'DWLR_IN_GJ_03', name: 'Surat - Athwa', district: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
    { id: 'DWLR_IN_RJ_01', name: 'Jaipur - MI Road', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
    { id: 'DWLR_IN_RJ_02', name: 'Jodhpur - Sardarpura', district: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243 },
    { id: 'DWLR_IN_RJ_03', name: 'Udaipur - Fateh Sagar', district: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lon: 73.7125 },
    { id: 'DWLR_IN_UP_01', name: 'Lucknow - Hazratganj', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
    { id: 'DWLR_IN_UP_02', name: 'Kanpur - Civil Lines', district: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
    { id: 'DWLR_IN_UP_03', name: 'Varanasi - Cantt', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
    { id: 'DWLR_IN_MP_01', name: 'Bhopal - New Market', district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
    { id: 'DWLR_IN_MP_02', name: 'Indore - Vijay Nagar', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
    { id: 'DWLR_IN_MP_03', name: 'Gwalior - City Center', district: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828 },
    { id: 'DWLR_IN_KA_01', name: 'Bengaluru - Koramangala', district: 'Bengaluru', state: 'Karnataka', lat: 12.9352, lon: 77.6245 },
    { id: 'DWLR_IN_KA_02', name: 'Mysuru - Nazarbad', district: 'Mysuru', state: 'Karnataka', lat: 12.2958, lon: 76.6394 },
    { id: 'DWLR_IN_KA_03', name: 'Mangaluru - Hampankatta', district: 'Dakshina Kannada', state: 'Karnataka', lat: 12.8692, lon: 74.8436 },
    { id: 'DWLR_IN_AP_01', name: 'Hyderabad - Banjara Hills', district: 'Hyderabad', state: 'Andhra Pradesh', lat: 17.4239, lon: 78.4738 },
    { id: 'DWLR_IN_AP_02', name: 'Vijayawada - MG Road', district: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
    { id: 'DWLR_IN_AP_03', name: 'Visakhapatnam - Beach Road', district: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
    { id: 'DWLR_IN_KL_01', name: 'Thiruvananthapuram - Statue', district: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366 },
    { id: 'DWLR_IN_KL_02', name: 'Kochi - Marine Drive', district: 'Ernakulam', state: 'Kerala', lat: 9.9312, lon: 76.2673 },
    { id: 'DWLR_IN_KL_03', name: 'Kozhikode - Beach', district: 'Kozhikode', state: 'Kerala', lat: 11.2588, lon: 75.7804 },
    { id: 'DWLR_IN_WB_01', name: 'Kolkata - Park Street', district: 'Kolkata', state: 'West Bengal', lat: 22.5535, lon: 88.3512 },
    { id: 'DWLR_IN_WB_02', name: 'Howrah - Station', district: 'Howrah', state: 'West Bengal', lat: 22.5958, lon: 88.2636 },
    { id: 'DWLR_IN_AS_01', name: 'Guwahati - Dispur', district: 'Kamrup Metropolitan', state: 'Assam', lat: 26.1445, lon: 91.7362 },
    { id: 'DWLR_IN_AS_02', name: 'Dibrugarh - Town', district: 'Dibrugarh', state: 'Assam', lat: 27.4728, lon: 94.9120 },
    { id: 'DWLR_IN_BR_01', name: 'Patna - Gandhi Maidan', district: 'Patna', state: 'Bihar', lat: 25.6116, lon: 85.1376 },
    { id: 'DWLR_IN_BR_02', name: 'Gaya - Town', district: 'Gaya', state: 'Bihar', lat: 24.7955, lon: 84.9994 },
    { id: 'DWLR_IN_OR_01', name: 'Bhubaneswar - Unit IV', district: 'Khordha', state: 'Odisha', lat: 20.2961, lon: 85.8245 },
    { id: 'DWLR_IN_OR_02', name: 'Cuttack - Badambadi', district: 'Cuttack', state: 'Odisha', lat: 20.4625, lon: 85.8829 },
    { id: 'DWLR_IN_PB_01', name: 'Ludhiana - Feroze Gandhi', district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
    { id: 'DWLR_IN_PB_02', name: 'Amritsar - Hall Bazar', district: 'Amritsar', state: 'Punjab', lat: 31.6340, lon: 74.8723 },
    { id: 'DWLR_IN_HR_01', name: 'Faridabad - NIT', district: 'Faridabad', state: 'Haryana', lat: 28.4089, lon: 77.3178 },
    { id: 'DWLR_IN_HR_02', name: 'Gurugram - Sector 29', district: 'Gurugram', state: 'Haryana', lat: 28.4595, lon: 77.0266 },
    { id: 'DWLR_IN_DL_01', name: 'New Delhi - Connaught Place', district: 'New Delhi', state: 'Delhi', lat: 28.6315, lon: 77.2167 },
    { id: 'DWLR_IN_JH_01', name: 'Ranchi - Main Road', district: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096 },
    { id: 'DWLR_IN_JH_02', name: 'Jamshedpur - Bistupur', district: 'East Singhbhum', state: 'Jharkhand', lat: 22.8046, lon: 86.2029 },
    { id: 'DWLR_IN_CH_01', name: 'Raipur - Telibandha', district: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lon: 81.6296 },
    { id: 'DWLR_IN_CH_02', name: 'Bilaspur - Vyapar Vihar', district: 'Bilaspur', state: 'Chhattisgarh', lat: 22.0796, lon: 82.1391 },
    { id: 'DWLR_IN_TG_01', name: 'Hyderabad - Secunderabad', district: 'Hyderabad', state: 'Telangana', lat: 17.4399, lon: 78.4983 },
    { id: 'DWLR_IN_TG_02', name: 'Warangal - Hanumakonda', district: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941 },
    { id: 'DWLR_IN_HP_01', name: 'Shimla - Mall Road', district: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734 },
    { id: 'DWLR_IN_UK_01', name: 'Dehradun - Rajpur Road', district: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322 },
    { id: 'DWLR_IN_GA_01', name: 'Panaji - Fontainhas', district: 'North Goa', state: 'Goa', lat: 15.4989, lon: 73.8278 }
  ];

  function addStationWithReadings(s) {
    const stationId = s.id;
    const normalThreshold = 15 + Math.random() * 10;
    const warningThreshold = normalThreshold * 0.7;
    const criticalThreshold = normalThreshold * 0.5;
    const state = s.state || 'Tamil Nadu';
    const station = {
      id: stationId,
      name: s.name,
      state,
      district: s.district,
      lat: s.lat,
      lon: s.lon,
      elevation: Math.floor(50 + Math.random() * 500),
      metadata: { installationDate: '2020-01-01', sensorType: 'DWLR' },
      normalThreshold,
      warningThreshold,
      criticalThreshold,
      createdAt: new Date('2020-01-01').toISOString()
    };
    stations.set(stationId, station);
    readings.set(stationId, []);
    const now = new Date();
    for (let d = 0; d < 30; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      for (let h = 0; h < 24; h += 6) {
        const ts = new Date(date);
        ts.setHours(h, 0, 0, 0);
        const baseLevel = normalThreshold * (0.6 + Math.random() * 0.4);
        const level = baseLevel + (Math.random() - 0.5) * 2;
        readings.get(stationId).push({
          id: `${stationId}_${ts.toISOString()}`,
          stationId,
          ts: ts.toISOString(),
          level: parseFloat(level.toFixed(2)),
          qc: 'OK',
          raw: {}
        });
      }
    }
    readings.get(stationId).sort((a, b) => new Date(a.ts) - new Date(b.ts));
  }

  moreTamilNaduStations.forEach(addStationWithReadings);
  allIndiaStations.forEach(addStationWithReadings);

  console.log(`Initialized ${stations.size} stations with sample data`);
}

export function getUserByUsername(username) {
  return users.get(username);
}

export function getAllStations(filters = {}) {
  let stationArray = Array.from(stations.values());
  
  if (filters.state) {
    stationArray = stationArray.filter(s => s.state === filters.state);
  }
  if (filters.district) {
    stationArray = stationArray.filter(s => s.district === filters.district);
  }
  if (filters.status) {
    stationArray = stationArray.filter(s => {
      const latest = getLatestReading(s.id);
      if (!latest) return false;
      const status = classifyLevel(latest.level, s);
      return status === filters.status;
    });
  }
  
  return stationArray;
}

export function getStationById(id) {
  return stations.get(id);
}

export function getLatestReading(stationId) {
  const stationReadings = readings.get(stationId) || [];
  return stationReadings.length > 0 ? stationReadings[stationReadings.length - 1] : null;
}

export function getTimeSeries(stationId, from, to, interval = 'daily') {
  const stationReadings = readings.get(stationId) || [];
  
  let filtered = stationReadings.filter(r => {
    const ts = new Date(r.ts);
    return ts >= from && ts <= to;
  });
  
  if (interval === 'daily') {
    // Group by day
    const grouped = {};
    filtered.forEach(r => {
      const day = r.ts.split('T')[0];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(r);
    });
    return Object.keys(grouped).sort().map(day => {
      const dayReadings = grouped[day];
      const avgLevel = dayReadings.reduce((sum, r) => sum + r.level, 0) / dayReadings.length;
      return {
        ts: `${day}T00:00:00Z`,
        level: parseFloat(avgLevel.toFixed(2)),
        qc: dayReadings[0].qc,
        count: dayReadings.length
      };
    });
  } else if (interval === 'weekly') {
    // Group by week
    const grouped = {};
    filtered.forEach(r => {
      const date = new Date(r.ts);
      const week = getWeekKey(date);
      if (!grouped[week]) grouped[week] = [];
      grouped[week].push(r);
    });
    return Object.keys(grouped).sort().map(week => {
      const weekReadings = grouped[week];
      const avgLevel = weekReadings.reduce((sum, r) => sum + r.level, 0) / weekReadings.length;
      return {
        ts: weekReadings[0].ts,
        level: parseFloat(avgLevel.toFixed(2)),
        qc: weekReadings[0].qc,
        count: weekReadings.length
      };
    });
  }
  
  return filtered;
}

function getWeekKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const week = Math.ceil((d.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
}

export function classifyLevel(level, station) {
  if (level <= station.criticalThreshold) return 'critical';
  if (level <= station.warningThreshold) return 'warning';
  return 'normal';
}

// Dashboard summary: counts, avg level, and 30-day trend
export function getDashboardSummary() {
  const allStations = Array.from(stations.values());
  let criticalCount = 0;
  let warningCount = 0;
  let normalCount = 0;
  const levels = [];

  allStations.forEach(station => {
    const latest = getLatestReading(station.id);
    if (!latest) return;
    const status = classifyLevel(latest.level, station);
    if (status === 'critical') criticalCount++;
    else if (status === 'warning') warningCount++;
    else normalCount++;
    levels.push(latest.level);
  });

  const avgLevel = levels.length > 0
    ? parseFloat((levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(2))
    : 0;

  // Build 30-day trend: for each day, avg level and status counts
  const trend = [];
  const now = new Date();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dayStr = date.toISOString().split('T')[0];
    const dayLevels = [];
    let dayCritical = 0, dayWarning = 0, dayNormal = 0;

    allStations.forEach(station => {
      const stationReadings = readings.get(station.id) || [];
      const dayReadings = stationReadings.filter(r => r.ts.startsWith(dayStr));
      if (dayReadings.length === 0) return;
      const dayAvg = dayReadings.reduce((s, r) => s + r.level, 0) / dayReadings.length;
      dayLevels.push(dayAvg);
      const status = classifyLevel(dayAvg, station);
      if (status === 'critical') dayCritical++;
      else if (status === 'warning') dayWarning++;
      else dayNormal++;
    });

    trend.push({
      date: dayStr,
      avgLevel: dayLevels.length > 0
        ? parseFloat((dayLevels.reduce((a, b) => a + b, 0) / dayLevels.length).toFixed(2))
        : null,
      criticalCount: dayCritical,
      warningCount: dayWarning,
      normalCount: dayNormal
    });
  }

  return {
    totalStations: allStations.length,
    criticalCount,
    warningCount,
    normalCount,
    avgLevel,
    trend
  };
}

export function addReadings(stationId, newReadings) {
  if (!stations.has(stationId)) {
    throw new Error(`Station ${stationId} not found`);
  }
  
  const existing = readings.get(stationId) || [];
  const existingMap = new Map(existing.map(r => [r.ts, r]));
  
  let inserted = 0;
  let rejected = 0;
  const errors = [];
  
  newReadings.forEach((reading, idx) => {
    if (existingMap.has(reading.ts)) {
      // Update existing
      const existingIdx = existing.findIndex(r => r.ts === reading.ts);
      existing[existingIdx] = {
        id: `${stationId}_${reading.ts}`,
        stationId,
        ...reading
      };
      inserted++;
    } else {
      existing.push({
        id: `${stationId}_${reading.ts}`,
        stationId,
        ...reading
      });
      inserted++;
    }
  });
  
  // Sort by timestamp
  existing.sort((a, b) => new Date(a.ts) - new Date(b.ts));
  readings.set(stationId, existing);
  
  return { inserted, rejected, errors };
}
