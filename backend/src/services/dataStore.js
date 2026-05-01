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
    passwordHash: '$2a$10$NVzAAJnHvf1.c3o3LL4C.uDZcpJgfY80XzgoMvlrMyuD6FyWYRyqi', // Password@123
    role: 'Researcher',
    regionRestrictions: null
  });
  users.set('planner', {
    id: '2',
    username: 'planner',
    passwordHash: '$2a$10$NVzAAJnHvf1.c3o3LL4C.uDZcpJgfY80XzgoMvlrMyuD6FyWYRyqi', // Password@123
    role: 'Planner',
    regionRestrictions: null
  });
  users.set('admin', {
    id: '3',
    username: 'admin',
    passwordHash: '$2a$10$NVzAAJnHvf1.c3o3LL4C.uDZcpJgfY80XzgoMvlrMyuD6FyWYRyqi', // Password@123
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

  // More Tamil Nadu cities – comprehensive coverage of all 38 districts
  const moreTamilNaduStations = [
    // Coimbatore
    { id: 'DWLR_TN_021', name: 'Coimbatore - RS Puram', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
    { id: 'DWLR_TN_022', name: 'Coimbatore - Gandhipuram', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0080, lon: 76.9670 },
    { id: 'DWLR_TN_C03', name: 'Coimbatore - Peelamedu', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0250, lon: 77.0020 },
    // Madurai
    { id: 'DWLR_TN_023', name: 'Madurai - KK Nagar', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198 },
    { id: 'DWLR_TN_024', name: 'Madurai - Tallakulam', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9350, lon: 78.1300 },
    { id: 'DWLR_TN_M03', name: 'Madurai - Thirumangalam', district: 'Madurai', state: 'Tamil Nadu', lat: 9.8200, lon: 77.9800 },
    // Salem
    { id: 'DWLR_TN_025', name: 'Salem - Hasthampatti', district: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lon: 78.1460 },
    { id: 'DWLR_TN_026', name: 'Salem - Suramangalam', district: 'Salem', state: 'Tamil Nadu', lat: 11.6500, lon: 78.1600 },
    // Tiruchirappalli
    { id: 'DWLR_TN_027', name: 'Tiruchirappalli - Srirangam', district: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7047 },
    { id: 'DWLR_TN_028', name: 'Tiruchirappalli - Tennur', district: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.8100, lon: 78.6900 },
    // Thanjavur
    { id: 'DWLR_TN_029', name: 'Thanjavur - Town', district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7869, lon: 79.1378 },
    { id: 'DWLR_TN_TJ2', name: 'Thanjavur - Kumbakonam', district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.9617, lon: 79.3917 },
    // Tirunelveli
    { id: 'DWLR_TN_030', name: 'Tirunelveli - Palayamkottai', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lon: 77.7567 },
    { id: 'DWLR_TN_TV2', name: 'Tirunelveli - Ambasamudram', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7100, lon: 77.4500 },
    // Dindigul
    { id: 'DWLR_TN_031', name: 'Dindigul - Natham Road', district: 'Dindigul', state: 'Tamil Nadu', lat: 10.3680, lon: 77.9803 },
    // Kanchipuram
    { id: 'DWLR_TN_032', name: 'Kanchipuram - Town', district: 'Kanchipuram', state: 'Tamil Nadu', lat: 12.8342, lon: 79.7036 },
    // Tiruppur
    { id: 'DWLR_TN_033', name: 'Tiruppur - Kumaran Road', district: 'Tiruppur', state: 'Tamil Nadu', lat: 11.1085, lon: 77.3411 },
    { id: 'DWLR_TN_TP2', name: 'Tiruppur - Avinashi', district: 'Tiruppur', state: 'Tamil Nadu', lat: 11.1900, lon: 77.2700 },
    // Cuddalore
    { id: 'DWLR_TN_034', name: 'Cuddalore - Town', district: 'Cuddalore', state: 'Tamil Nadu', lat: 11.7560, lon: 79.7543 },
    // Namakkal extras
    { id: 'DWLR_TN_035', name: 'Namakkal - KSR College', district: 'Namakkal', state: 'Tamil Nadu', lat: 11.3632, lon: 77.8282 },
    { id: 'DWLR_TN_036', name: 'Namakkal - KSRCT', district: 'Namakkal', state: 'Tamil Nadu', lat: 11.3620, lon: 77.8279 },
    // Virudhunagar
    { id: 'DWLR_TN_037', name: 'Sivakasi - Town', district: 'Virudhunagar', state: 'Tamil Nadu', lat: 9.4531, lon: 77.8072 },
    { id: 'DWLR_TN_VN2', name: 'Virudhunagar - Town', district: 'Virudhunagar', state: 'Tamil Nadu', lat: 9.5850, lon: 77.9570 },
    // Thoothukudi
    { id: 'DWLR_TN_TK1', name: 'Thoothukudi - Beach Road', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.7642, lon: 78.1348 },
    { id: 'DWLR_TN_TK2', name: 'Thoothukudi - Harbor Area', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.7567, lon: 78.1498 },
    // Ramanathapuram
    { id: 'DWLR_TN_RM1', name: 'Ramanathapuram - Town', district: 'Ramanathapuram', state: 'Tamil Nadu', lat: 9.3639, lon: 78.8395 },
    { id: 'DWLR_TN_RM2', name: 'Rameswaram - Temple Town', district: 'Ramanathapuram', state: 'Tamil Nadu', lat: 9.2876, lon: 79.3129 },
    // Nagapattinam
    { id: 'DWLR_TN_NP1', name: 'Nagapattinam - Town', district: 'Nagapattinam', state: 'Tamil Nadu', lat: 10.7672, lon: 79.8449 },
    { id: 'DWLR_TN_NP2', name: 'Velankanni - Shrine', district: 'Nagapattinam', state: 'Tamil Nadu', lat: 10.6835, lon: 79.8550 },
    // Karur
    { id: 'DWLR_TN_KR1', name: 'Karur - Town', district: 'Karur', state: 'Tamil Nadu', lat: 10.9601, lon: 78.0766 },
    { id: 'DWLR_TN_KR2', name: 'Karur - Kulithalai', district: 'Karur', state: 'Tamil Nadu', lat: 10.9380, lon: 78.4190 },
    // Krishnagiri
    { id: 'DWLR_TN_KG1', name: 'Krishnagiri - Town', district: 'Krishnagiri', state: 'Tamil Nadu', lat: 12.5186, lon: 78.2137 },
    { id: 'DWLR_TN_KG2', name: 'Hosur - Industrial Area', district: 'Krishnagiri', state: 'Tamil Nadu', lat: 12.7409, lon: 77.8253 },
    // Dharmapuri
    { id: 'DWLR_TN_DP1', name: 'Dharmapuri - Town', district: 'Dharmapuri', state: 'Tamil Nadu', lat: 12.1211, lon: 78.1582 },
    // Perambalur
    { id: 'DWLR_TN_PB1', name: 'Perambalur - Town', district: 'Perambalur', state: 'Tamil Nadu', lat: 11.2333, lon: 78.8833 },
    // Ariyalur
    { id: 'DWLR_TN_AR1', name: 'Ariyalur - Town', district: 'Ariyalur', state: 'Tamil Nadu', lat: 11.1400, lon: 79.0761 },
    // Pudukkottai
    { id: 'DWLR_TN_PK1', name: 'Pudukkottai - Town', district: 'Pudukkottai', state: 'Tamil Nadu', lat: 10.3833, lon: 78.8001 },
    // Sivagangai
    { id: 'DWLR_TN_SG1', name: 'Sivagangai - Town', district: 'Sivagangai', state: 'Tamil Nadu', lat: 10.0478, lon: 78.4887 },
    { id: 'DWLR_TN_SG2', name: 'Karaikudi - Town', district: 'Sivagangai', state: 'Tamil Nadu', lat: 10.0732, lon: 78.7808 },
    // Theni
    { id: 'DWLR_TN_TH1', name: 'Theni - Town', district: 'Theni', state: 'Tamil Nadu', lat: 10.0104, lon: 77.4768 },
    { id: 'DWLR_TN_TH2', name: 'Bodinayakanur - Town', district: 'Theni', state: 'Tamil Nadu', lat: 10.0115, lon: 77.3474 },
    // Tenkasi
    { id: 'DWLR_TN_TS1', name: 'Tenkasi - Town', district: 'Tenkasi', state: 'Tamil Nadu', lat: 8.9604, lon: 77.3152 },
    { id: 'DWLR_TN_TS2', name: 'Courtallam - Falls Area', district: 'Tenkasi', state: 'Tamil Nadu', lat: 8.9333, lon: 77.2833 },
    // Nilgiris
    { id: 'DWLR_TN_NI1', name: 'Ooty - Town', district: 'Nilgiris', state: 'Tamil Nadu', lat: 11.4102, lon: 76.6950 },
    { id: 'DWLR_TN_NI2', name: 'Coonoor - Town', district: 'Nilgiris', state: 'Tamil Nadu', lat: 11.3530, lon: 76.7959 },
    // Villupuram
    { id: 'DWLR_TN_VP1', name: 'Villupuram - Town', district: 'Villupuram', state: 'Tamil Nadu', lat: 11.9401, lon: 79.4861 },
    { id: 'DWLR_TN_VP2', name: 'Tindivanam - Town', district: 'Villupuram', state: 'Tamil Nadu', lat: 12.2340, lon: 79.6520 },
    // Chengalpattu
    { id: 'DWLR_TN_CG1', name: 'Chengalpattu - Town', district: 'Chengalpattu', state: 'Tamil Nadu', lat: 12.6819, lon: 79.9888 },
    { id: 'DWLR_TN_CG2', name: 'Mahabalipuram - Shore Temple', district: 'Chengalpattu', state: 'Tamil Nadu', lat: 12.6269, lon: 80.1927 },
    // Ranipet
    { id: 'DWLR_TN_RP1', name: 'Ranipet - Town', district: 'Ranipet', state: 'Tamil Nadu', lat: 12.9337, lon: 79.3333 },
    { id: 'DWLR_TN_RP2', name: 'Walajah - Town', district: 'Ranipet', state: 'Tamil Nadu', lat: 12.9300, lon: 79.3700 },
    // Tirupattur
    { id: 'DWLR_TN_TT1', name: 'Tirupattur - Town', district: 'Tirupattur', state: 'Tamil Nadu', lat: 12.4960, lon: 78.5730 },
    { id: 'DWLR_TN_TT2', name: 'Vaniyambadi - Town', district: 'Tirupattur', state: 'Tamil Nadu', lat: 12.6813, lon: 78.6200 },
    // Tiruvallur
    { id: 'DWLR_TN_TL1', name: 'Tiruvallur - Town', district: 'Tiruvallur', state: 'Tamil Nadu', lat: 13.1432, lon: 79.9107 },
    { id: 'DWLR_TN_TL2', name: 'Avadi - Town', district: 'Tiruvallur', state: 'Tamil Nadu', lat: 13.1067, lon: 80.1014 },
    // Kallakurichi
    { id: 'DWLR_TN_KK1', name: 'Kallakurichi - Town', district: 'Kallakurichi', state: 'Tamil Nadu', lat: 11.7400, lon: 78.9590 },
    // Mayiladuthurai
    { id: 'DWLR_TN_MY1', name: 'Mayiladuthurai - Town', district: 'Mayiladuthurai', state: 'Tamil Nadu', lat: 11.1018, lon: 79.6533 },
    // Tiruvannamalai
    { id: 'DWLR_TN_TA1', name: 'Tiruvannamalai - Town', district: 'Tiruvannamalai', state: 'Tamil Nadu', lat: 12.2253, lon: 79.0747 },
    { id: 'DWLR_TN_TA2', name: 'Arunachaleswara Temple', district: 'Tiruvannamalai', state: 'Tamil Nadu', lat: 12.2309, lon: 79.0689 },
    // Nagercoil / Kanyakumari
    { id: 'DWLR_TN_KN1', name: 'Nagercoil - Town', district: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.1833, lon: 77.4119 },
    { id: 'DWLR_TN_KN2', name: 'Kanyakumari - Beach', district: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.0883, lon: 77.5385 },
    { id: 'DWLR_TN_KN3', name: 'Marthandam - Town', district: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.3067, lon: 77.2200 },
    { id: 'DWLR_TN_KN4', name: 'Colachel - Harbor', district: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.1761, lon: 77.2508 },
    // Extra Coimbatore sub-areas
    { id: 'DWLR_TN_C04', name: 'Coimbatore - Saravanampatti', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0800, lon: 76.9900 },
    { id: 'DWLR_TN_C05', name: 'Pollachi - Town', district: 'Coimbatore', state: 'Tamil Nadu', lat: 10.6609, lon: 77.0080 },
    { id: 'DWLR_TN_C06', name: 'Mettupalayam - Town', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.2994, lon: 76.9400 },
    { id: 'DWLR_TN_C07', name: 'Valparai - Hill Station', district: 'Coimbatore', state: 'Tamil Nadu', lat: 10.3263, lon: 76.9530 },
    // Extra Madurai sub-areas
    { id: 'DWLR_TN_M04', name: 'Madurai - Usilampatti', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9700, lon: 77.7800 },
    { id: 'DWLR_TN_M05', name: 'Madurai - Melur', district: 'Madurai', state: 'Tamil Nadu', lat: 10.0300, lon: 78.3400 },
    { id: 'DWLR_TN_M06', name: 'Madurai - Vadipatti', district: 'Madurai', state: 'Tamil Nadu', lat: 10.0900, lon: 77.9600 },
    // Extra Salem sub-areas
    { id: 'DWLR_TN_SL3', name: 'Salem - Attur', district: 'Salem', state: 'Tamil Nadu', lat: 11.5935, lon: 78.6011 },
    { id: 'DWLR_TN_SL4', name: 'Salem - Mettur Dam', district: 'Salem', state: 'Tamil Nadu', lat: 11.7800, lon: 77.8000 },
    { id: 'DWLR_TN_SL5', name: 'Salem - Omalur', district: 'Salem', state: 'Tamil Nadu', lat: 11.7400, lon: 78.0500 },
    // Extra Trichy sub-areas
    { id: 'DWLR_TN_TC3', name: 'Tiruchirappalli - Lalgudi', district: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.8700, lon: 78.8200 },
    { id: 'DWLR_TN_TC4', name: 'Tiruchirappalli - Thuraiyur', district: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 11.1500, lon: 78.6000 },
    { id: 'DWLR_TN_TC5', name: 'Tiruchirappalli - Musiri', district: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.9500, lon: 78.4400 },
    // Extra Thanjavur sub-areas
    { id: 'DWLR_TN_TJ3', name: 'Thanjavur - Pattukkottai', district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.4300, lon: 79.3200 },
    { id: 'DWLR_TN_TJ4', name: 'Thanjavur - Orathanadu', district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.6300, lon: 79.2300 },
    // Extra Dindigul sub-areas
    { id: 'DWLR_TN_DG2', name: 'Dindigul - Palani', district: 'Dindigul', state: 'Tamil Nadu', lat: 10.4500, lon: 77.5200 },
    { id: 'DWLR_TN_DG3', name: 'Dindigul - Oddanchatram', district: 'Dindigul', state: 'Tamil Nadu', lat: 10.2800, lon: 77.7500 },
    { id: 'DWLR_TN_DG4', name: 'Kodaikanal - Hill Station', district: 'Dindigul', state: 'Tamil Nadu', lat: 10.2381, lon: 77.4892 },
    // Extra Tirunelveli sub-areas
    { id: 'DWLR_TN_TV3', name: 'Tirunelveli - Sankarankovil', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 9.1800, lon: 77.5400 },
    { id: 'DWLR_TN_TV4', name: 'Tirunelveli - Tenkasi Road', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.8300, lon: 77.5800 },
    // Extra Cuddalore sub-areas
    { id: 'DWLR_TN_CD2', name: 'Cuddalore - Chidambaram', district: 'Cuddalore', state: 'Tamil Nadu', lat: 11.3990, lon: 79.6945 },
    { id: 'DWLR_TN_CD3', name: 'Cuddalore - Virudhachalam', district: 'Cuddalore', state: 'Tamil Nadu', lat: 11.5200, lon: 79.3200 },
    { id: 'DWLR_TN_CD4', name: 'Cuddalore - Panruti', district: 'Cuddalore', state: 'Tamil Nadu', lat: 11.7700, lon: 79.5700 },
    // Extra Villupuram sub-areas
    { id: 'DWLR_TN_VP3', name: 'Villupuram - Gingee', district: 'Villupuram', state: 'Tamil Nadu', lat: 12.2500, lon: 79.4200 },
    { id: 'DWLR_TN_VP4', name: 'Villupuram - Ulundurpet', district: 'Villupuram', state: 'Tamil Nadu', lat: 11.7600, lon: 79.3300 },
    // Extra Krishnagiri sub-areas
    { id: 'DWLR_TN_KG3', name: 'Krishnagiri - Pochampalli', district: 'Krishnagiri', state: 'Tamil Nadu', lat: 12.3600, lon: 78.3500 },
    { id: 'DWLR_TN_KG4', name: 'Denkanikottai - Town', district: 'Krishnagiri', state: 'Tamil Nadu', lat: 12.5300, lon: 77.7900 },
    // Extra Dharmapuri sub-areas
    { id: 'DWLR_TN_DP2', name: 'Dharmapuri - Palacode', district: 'Dharmapuri', state: 'Tamil Nadu', lat: 12.2300, lon: 77.9100 },
    { id: 'DWLR_TN_DP3', name: 'Dharmapuri - Harur', district: 'Dharmapuri', state: 'Tamil Nadu', lat: 12.0500, lon: 78.4800 },
    // Extra Erode sub-areas
    { id: 'DWLR_TN_ER6', name: 'Erode - Gobichettipalayam', district: 'Erode', state: 'Tamil Nadu', lat: 11.4530, lon: 77.4360 },
    { id: 'DWLR_TN_ER7', name: 'Erode - Anthiyur', district: 'Erode', state: 'Tamil Nadu', lat: 11.5700, lon: 77.5900 },
    // Extra Tiruppur sub-areas
    { id: 'DWLR_TN_TP3', name: 'Tiruppur - Udumalpet', district: 'Tiruppur', state: 'Tamil Nadu', lat: 10.5900, lon: 77.2500 },
    { id: 'DWLR_TN_TP4', name: 'Tiruppur - Dharapuram', district: 'Tiruppur', state: 'Tamil Nadu', lat: 10.7350, lon: 77.5200 },
    // Extra Chennai sub-areas
    { id: 'DWLR_TN_CH7', name: 'Chennai - Sholinganallur', district: 'Chennai', state: 'Tamil Nadu', lat: 12.9010, lon: 80.2280 },
    { id: 'DWLR_TN_CH8', name: 'Chennai - Madhavaram', district: 'Chennai', state: 'Tamil Nadu', lat: 13.1500, lon: 80.2300 },
    { id: 'DWLR_TN_CH9', name: 'Chennai - Ennore', district: 'Chennai', state: 'Tamil Nadu', lat: 13.2200, lon: 80.3200 },
    { id: 'DWLR_TN_CH10', name: 'Chennai - Tambaram', district: 'Chennai', state: 'Tamil Nadu', lat: 12.9249, lon: 80.1000 },
    // Extra Chengalpattu sub-areas
    { id: 'DWLR_TN_CG3', name: 'Chengalpattu - Thiruporur', district: 'Chengalpattu', state: 'Tamil Nadu', lat: 12.7200, lon: 80.1800 },
    { id: 'DWLR_TN_CG4', name: 'Chengalpattu - Kelambakkam', district: 'Chengalpattu', state: 'Tamil Nadu', lat: 12.7880, lon: 80.2200 },
    // Extra Thoothukudi sub-areas
    { id: 'DWLR_TN_TK3', name: 'Thoothukudi - Kovilpatti', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 9.1700, lon: 77.8700 },
    { id: 'DWLR_TN_TK4', name: 'Thoothukudi - Ettayapuram', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 9.1465, lon: 78.0019 },
    { id: 'DWLR_TN_TK5', name: 'Thoothukudi - Tiruchendur', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.4942, lon: 78.1190 },
    // Extra Ramanathapuram sub-areas
    { id: 'DWLR_TN_RM3', name: 'Ramanathapuram - Paramakudi', district: 'Ramanathapuram', state: 'Tamil Nadu', lat: 9.5400, lon: 78.5900 },
    { id: 'DWLR_TN_RM4', name: 'Ramanathapuram - Mudukulathur', district: 'Ramanathapuram', state: 'Tamil Nadu', lat: 9.3400, lon: 78.5100 },
    // Extra Pudukkottai sub-areas
    { id: 'DWLR_TN_PK2', name: 'Pudukkottai - Aranthangi', district: 'Pudukkottai', state: 'Tamil Nadu', lat: 10.1700, lon: 79.0100 },
    { id: 'DWLR_TN_PK3', name: 'Pudukkottai - Karambakudi', district: 'Pudukkottai', state: 'Tamil Nadu', lat: 10.4500, lon: 79.1000 },
    // Extra Sivagangai sub-areas
    { id: 'DWLR_TN_SG3', name: 'Sivagangai - Devakottai', district: 'Sivagangai', state: 'Tamil Nadu', lat: 9.9500, lon: 78.8300 },
    { id: 'DWLR_TN_SG4', name: 'Sivagangai - Manamadurai', district: 'Sivagangai', state: 'Tamil Nadu', lat: 9.6700, lon: 78.4700 },
    // Extra Kanchipuram sub-areas
    { id: 'DWLR_TN_KC2', name: 'Kanchipuram - Sriperumbudur', district: 'Kanchipuram', state: 'Tamil Nadu', lat: 12.9670, lon: 79.9430 },
    { id: 'DWLR_TN_KC3', name: 'Kanchipuram - Uthiramerur', district: 'Kanchipuram', state: 'Tamil Nadu', lat: 12.6100, lon: 79.7700 },
    // Pondicherry border area stations
    { id: 'DWLR_TN_PD1', name: 'Pondicherry Border - Bahour', district: 'Villupuram', state: 'Tamil Nadu', lat: 11.8100, lon: 79.7400 },
    { id: 'DWLR_TN_PD2', name: 'Auroville Area', district: 'Villupuram', state: 'Tamil Nadu', lat: 12.0062, lon: 79.8107 },
    // Extra Tiruvannamalai sub-areas
    { id: 'DWLR_TN_TA3', name: 'Tiruvannamalai - Polur', district: 'Tiruvannamalai', state: 'Tamil Nadu', lat: 12.5100, lon: 79.1200 },
    { id: 'DWLR_TN_TA4', name: 'Tiruvannamalai - Chengam', district: 'Tiruvannamalai', state: 'Tamil Nadu', lat: 12.3100, lon: 78.7900 },
    // Extra Vellore sub-areas
    { id: 'DWLR_TN_VL6', name: 'Vellore - Ambur', district: 'Vellore', state: 'Tamil Nadu', lat: 12.7900, lon: 78.7200 },
    { id: 'DWLR_TN_VL7', name: 'Vellore - Sholingur', district: 'Vellore', state: 'Tamil Nadu', lat: 13.1200, lon: 79.4200 },
    // ── Gap-filler stations for empty map areas ──
    // South-central interior (between Dindigul, Madurai, Sivagangai)
    { id: 'DWLR_TN_GF01', name: 'Natham - Town', district: 'Dindigul', state: 'Tamil Nadu', lat: 10.2200, lon: 78.1900 },
    { id: 'DWLR_TN_GF02', name: 'Nilakkottai - Town', district: 'Dindigul', state: 'Tamil Nadu', lat: 10.1600, lon: 77.8700 },
    { id: 'DWLR_TN_GF03', name: 'Batlagundu - Town', district: 'Dindigul', state: 'Tamil Nadu', lat: 10.1660, lon: 77.7600 },
    // Between Karur and Dindigul (empty strip)
    { id: 'DWLR_TN_GF04', name: 'Aravakurichi - Town', district: 'Karur', state: 'Tamil Nadu', lat: 10.7600, lon: 77.9100 },
    { id: 'DWLR_TN_GF05', name: 'Kadavur - Town', district: 'Karur', state: 'Tamil Nadu', lat: 10.7900, lon: 78.1900 },
    // Between Trichy and Pudukkottai (empty area)
    { id: 'DWLR_TN_GF06', name: 'Alangudi - Town', district: 'Pudukkottai', state: 'Tamil Nadu', lat: 10.3600, lon: 78.9500 },
    { id: 'DWLR_TN_GF07', name: 'Illupppur - Town', district: 'Pudukkottai', state: 'Tamil Nadu', lat: 10.5200, lon: 78.6200 },
    { id: 'DWLR_TN_GF08', name: 'Ponnamaravathi - Town', district: 'Pudukkottai', state: 'Tamil Nadu', lat: 10.2800, lon: 78.5400 },
    // Coastal gap (east coast between Cuddalore and Nagapattinam)
    { id: 'DWLR_TN_GF09', name: 'Porto Novo - Coast', district: 'Cuddalore', state: 'Tamil Nadu', lat: 11.5050, lon: 79.7680 },
    { id: 'DWLR_TN_GF10', name: 'Sirkazhi - Town', district: 'Mayiladuthurai', state: 'Tamil Nadu', lat: 11.2370, lon: 79.7350 },
    { id: 'DWLR_TN_GF11', name: 'Karaikal - Coast', district: 'Nagapattinam', state: 'Tamil Nadu', lat: 10.9250, lon: 79.8380 },
    // Between Tirunelveli and Thoothukudi (south gap)
    { id: 'DWLR_TN_GF12', name: 'Nanguneri - Town', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.4900, lon: 77.6600 },
    { id: 'DWLR_TN_GF13', name: 'Radhapuram - Town', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.2700, lon: 77.8200 },
    { id: 'DWLR_TN_GF14', name: 'Kayathar - Town', district: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.9600, lon: 77.7800 },
    // Between Tenkasi and Kanyakumari (western gap)
    { id: 'DWLR_TN_GF15', name: 'Kadayanallur - Town', district: 'Tenkasi', state: 'Tamil Nadu', lat: 9.0700, lon: 77.3400 },
    { id: 'DWLR_TN_GF16', name: 'Shencottai - Town', district: 'Tenkasi', state: 'Tamil Nadu', lat: 8.9700, lon: 77.2500 },
    // Between Madurai and Ramanathapuram (east gap)
    { id: 'DWLR_TN_GF17', name: 'Tiruppuvanam - Town', district: 'Sivagangai', state: 'Tamil Nadu', lat: 9.8500, lon: 78.2600 },
    { id: 'DWLR_TN_GF18', name: 'Ilayangudi - Town', district: 'Sivagangai', state: 'Tamil Nadu', lat: 9.6600, lon: 78.6100 },
    // Between Virudhunagar and Sivagangai (south-central gap)
    { id: 'DWLR_TN_GF19', name: 'Aruppukkottai - Town', district: 'Virudhunagar', state: 'Tamil Nadu', lat: 9.5100, lon: 78.1000 },
    { id: 'DWLR_TN_GF20', name: 'Sattur - Town', district: 'Virudhunagar', state: 'Tamil Nadu', lat: 9.3500, lon: 77.9200 },
    // Western Ghats foothills (Theni-Dindigul gap)
    { id: 'DWLR_TN_GF21', name: 'Cumbum - Town', district: 'Theni', state: 'Tamil Nadu', lat: 9.7360, lon: 77.2830 },
    { id: 'DWLR_TN_GF22', name: 'Periyakulam - Town', district: 'Theni', state: 'Tamil Nadu', lat: 10.1200, lon: 77.5500 },
    { id: 'DWLR_TN_GF23', name: 'Uthamapalayam - Town', district: 'Theni', state: 'Tamil Nadu', lat: 9.8100, lon: 77.3300 },
    // Interior between Namakkal and Perambalur
    { id: 'DWLR_TN_GF24', name: 'Veppanthattai - Town', district: 'Perambalur', state: 'Tamil Nadu', lat: 11.2500, lon: 78.6500 },
    { id: 'DWLR_TN_GF25', name: 'Sendurai - Town', district: 'Ariyalur', state: 'Tamil Nadu', lat: 11.3000, lon: 79.1400 },
    // Between Salem and Kallakurichi
    { id: 'DWLR_TN_GF26', name: 'Sankaridurg - Town', district: 'Salem', state: 'Tamil Nadu', lat: 11.4700, lon: 78.1800 },
    { id: 'DWLR_TN_GF27', name: 'Kallakurichi - Chinnasalem', district: 'Kallakurichi', state: 'Tamil Nadu', lat: 11.6200, lon: 79.1200 },
    // Coast between Chennai and Cuddalore
    { id: 'DWLR_TN_GF28', name: 'Cheyyur - Town', district: 'Chengalpattu', state: 'Tamil Nadu', lat: 12.3500, lon: 80.0000 },
    { id: 'DWLR_TN_GF29', name: 'Marakkanam - Coast', district: 'Villupuram', state: 'Tamil Nadu', lat: 12.1900, lon: 79.9400 },
    // Between Coimbatore and Nilgiris (hill gap)
    { id: 'DWLR_TN_GF30', name: 'Kotagiri - Hill', district: 'Nilgiris', state: 'Tamil Nadu', lat: 11.4210, lon: 76.8620 },
    { id: 'DWLR_TN_GF31', name: 'Gudalur - Town', district: 'Nilgiris', state: 'Tamil Nadu', lat: 11.5030, lon: 76.4940 },
    // Interior gap between Tiruppur and Karur
    { id: 'DWLR_TN_GF32', name: 'Kangayam - Town', district: 'Tiruppur', state: 'Tamil Nadu', lat: 10.9900, lon: 77.5600 },
    { id: 'DWLR_TN_GF33', name: 'Palladam - Town', district: 'Tiruppur', state: 'Tamil Nadu', lat: 10.9200, lon: 77.2900 },
    // Between Thanjavur and Nagapattinam (delta gap)
    { id: 'DWLR_TN_GF34', name: 'Thiruvarur - Town', district: 'Thiruvarur', state: 'Tamil Nadu', lat: 10.7670, lon: 79.6370 },
    { id: 'DWLR_TN_GF35', name: 'Mannargudi - Town', district: 'Thiruvarur', state: 'Tamil Nadu', lat: 10.6660, lon: 79.4530 },
    { id: 'DWLR_TN_GF36', name: 'Nannilam - Town', district: 'Thiruvarur', state: 'Tamil Nadu', lat: 10.8800, lon: 79.6100 },
    // Ranipet-Tiruvannamalai gap
    { id: 'DWLR_TN_GF37', name: 'Arani - Town', district: 'Tiruvannamalai', state: 'Tamil Nadu', lat: 12.6700, lon: 79.2800 },
    { id: 'DWLR_TN_GF38', name: 'Cheyyar - Town', district: 'Tiruvannamalai', state: 'Tamil Nadu', lat: 12.6600, lon: 79.5500 },
    // Tiruvallur interior gap
    { id: 'DWLR_TN_GF39', name: 'Ponneri - Town', district: 'Tiruvallur', state: 'Tamil Nadu', lat: 13.3300, lon: 80.2000 },
    { id: 'DWLR_TN_GF40', name: 'Gummidipoondi - Town', district: 'Tiruvallur', state: 'Tamil Nadu', lat: 13.4000, lon: 80.1100 },
    // ── Thanjavur delta gap-fillers ──
    { id: 'DWLR_TN_DL01', name: 'Kodavasal - Town', district: 'Thiruvarur', state: 'Tamil Nadu', lat: 10.8600, lon: 79.5200 },
    { id: 'DWLR_TN_DL02', name: 'Needamangalam - Town', district: 'Thiruvarur', state: 'Tamil Nadu', lat: 10.7700, lon: 79.4200 },
    { id: 'DWLR_TN_DL03', name: 'Kuttanallur - Town', district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7100, lon: 79.5400 },
    { id: 'DWLR_TN_DL04', name: 'Thiruthuraipoondi - Town', district: 'Thiruvarur', state: 'Tamil Nadu', lat: 10.5300, lon: 79.6300 },
    { id: 'DWLR_TN_DL05', name: 'Muthupet - Town', district: 'Thiruvarur', state: 'Tamil Nadu', lat: 10.3940, lon: 79.4940 },
    { id: 'DWLR_TN_DL06', name: 'Vedaranyam - Coast', district: 'Nagapattinam', state: 'Tamil Nadu', lat: 10.3720, lon: 79.8500 },
    { id: 'DWLR_TN_DL07', name: 'Adirampattinam - Coast', district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.3400, lon: 79.3800 },
    { id: 'DWLR_TN_DL08', name: 'Perugavalandan - Town', district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.5600, lon: 79.4200 },
    // ── North TN interior gap-fillers ──
    { id: 'DWLR_TN_NI01', name: 'Jolarpet - Town', district: 'Tirupattur', state: 'Tamil Nadu', lat: 12.5700, lon: 78.5700 },
    { id: 'DWLR_TN_NI02', name: 'Vandavasi - Town', district: 'Tiruvannamalai', state: 'Tamil Nadu', lat: 12.5000, lon: 79.6100 },
    { id: 'DWLR_TN_NI03', name: 'Chetpet - Town', district: 'Tiruvannamalai', state: 'Tamil Nadu', lat: 12.4100, lon: 79.2100 },
    { id: 'DWLR_TN_NI04', name: 'Tirukovilur - Town', district: 'Villupuram', state: 'Tamil Nadu', lat: 11.9700, lon: 79.2100 },
    { id: 'DWLR_TN_NI05', name: 'Vikravandi - Town', district: 'Villupuram', state: 'Tamil Nadu', lat: 12.0200, lon: 79.5500 },
    { id: 'DWLR_TN_NI06', name: 'Sankarapuram - Town', district: 'Villupuram', state: 'Tamil Nadu', lat: 11.8700, lon: 78.8300 },
    { id: 'DWLR_TN_NI07', name: 'Pennagaram - Town', district: 'Dharmapuri', state: 'Tamil Nadu', lat: 12.1300, lon: 77.8900 },
    { id: 'DWLR_TN_NI08', name: 'Yercaud - Hill', district: 'Salem', state: 'Tamil Nadu', lat: 11.7800, lon: 78.2100 },
    { id: 'DWLR_TN_NI09', name: 'Neyveli - Town', district: 'Cuddalore', state: 'Tamil Nadu', lat: 11.5470, lon: 79.4860 },
    { id: 'DWLR_TN_NI10', name: 'Alangayam - Town', district: 'Tirupattur', state: 'Tamil Nadu', lat: 12.6200, lon: 78.7500 },
    { id: 'DWLR_TN_NI11', name: 'Veeraganur - Town', district: 'Salem', state: 'Tamil Nadu', lat: 11.5800, lon: 78.8000 },
    { id: 'DWLR_TN_NI12', name: 'Komarapalayam - Town', district: 'Namakkal', state: 'Tamil Nadu', lat: 11.4500, lon: 77.9800 },
    { id: 'DWLR_TN_NI13', name: 'Sentharapatti - Town', district: 'Salem', state: 'Tamil Nadu', lat: 11.5400, lon: 78.2200 },
    { id: 'DWLR_TN_NI14', name: 'Pottaroikadu - Reserve', district: 'Tiruvannamalai', state: 'Tamil Nadu', lat: 12.3600, lon: 79.0200 },
    { id: 'DWLR_TN_NI15', name: 'Adukkamparai - Town', district: 'Krishnagiri', state: 'Tamil Nadu', lat: 12.3800, lon: 78.1700 }
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
    { id: 'DWLR_IN_GA_01', name: 'Panaji - Fontainhas', district: 'North Goa', state: 'Goa', lat: 15.4989, lon: 73.8278 },
    // ── South India gap-fillers (Karnataka, AP, Telangana, Maharashtra, Kerala) ──
    // Karnataka interior
    { id: 'DWLR_IN_KA_04', name: 'Shivamogga - Town', district: 'Shivamogga', state: 'Karnataka', lat: 13.9299, lon: 75.5681 },
    { id: 'DWLR_IN_KA_05', name: 'Davanagere - Town', district: 'Davanagere', state: 'Karnataka', lat: 14.4644, lon: 75.9218 },
    { id: 'DWLR_IN_KA_06', name: 'Ballari - Town', district: 'Ballari', state: 'Karnataka', lat: 15.1394, lon: 76.9214 },
    { id: 'DWLR_IN_KA_07', name: 'Chitradurga - Fort', district: 'Chitradurga', state: 'Karnataka', lat: 14.2226, lon: 76.3980 },
    { id: 'DWLR_IN_KA_08', name: 'Tumkur - Town', district: 'Tumkur', state: 'Karnataka', lat: 13.3379, lon: 77.1173 },
    { id: 'DWLR_IN_KA_09', name: 'Hubballi - Vidyanagar', district: 'Dharwad', state: 'Karnataka', lat: 15.3647, lon: 75.1240 },
    { id: 'DWLR_IN_KA_10', name: 'Belgaum - Camp', district: 'Belagavi', state: 'Karnataka', lat: 15.8497, lon: 74.4977 },
    { id: 'DWLR_IN_KA_11', name: 'Udupi - Town', district: 'Udupi', state: 'Karnataka', lat: 13.3409, lon: 74.7421 },
    { id: 'DWLR_IN_KA_12', name: 'Raichur - Town', district: 'Raichur', state: 'Karnataka', lat: 16.2076, lon: 77.3463 },
    { id: 'DWLR_IN_KA_13', name: 'Kolar - Town', district: 'Kolar', state: 'Karnataka', lat: 13.1360, lon: 78.1292 },
    { id: 'DWLR_IN_KA_14', name: 'Hassan - Town', district: 'Hassan', state: 'Karnataka', lat: 13.0068, lon: 76.1003 },
    { id: 'DWLR_IN_KA_15', name: 'Mandya - Town', district: 'Mandya', state: 'Karnataka', lat: 12.5218, lon: 76.8951 },
    // Andhra Pradesh gap-fillers
    { id: 'DWLR_IN_AP_04', name: 'Kurnool - Town', district: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lon: 78.0373 },
    { id: 'DWLR_IN_AP_05', name: 'Anantapur - Town', district: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lon: 77.6006 },
    { id: 'DWLR_IN_AP_06', name: 'Kadapa - Town', district: 'Kadapa', state: 'Andhra Pradesh', lat: 14.4674, lon: 78.8241 },
    { id: 'DWLR_IN_AP_07', name: 'Nellore - Town', district: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lon: 79.9865 },
    { id: 'DWLR_IN_AP_08', name: 'Tirupati - Town', district: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192 },
    { id: 'DWLR_IN_AP_09', name: 'Guntur - Town', district: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
    { id: 'DWLR_IN_AP_10', name: 'Ongole - Town', district: 'Prakasam', state: 'Andhra Pradesh', lat: 15.5057, lon: 80.0499 },
    { id: 'DWLR_IN_AP_11', name: 'Kakinada - Port', district: 'East Godavari', state: 'Andhra Pradesh', lat: 16.9891, lon: 82.2475 },
    { id: 'DWLR_IN_AP_12', name: 'Eluru - Town', district: 'West Godavari', state: 'Andhra Pradesh', lat: 16.7107, lon: 81.0952 },
    { id: 'DWLR_IN_AP_13', name: 'Chittoor - Town', district: 'Chittoor', state: 'Andhra Pradesh', lat: 13.2172, lon: 79.1003 },
    { id: 'DWLR_IN_AP_14', name: 'Proddatur - Town', district: 'Kadapa', state: 'Andhra Pradesh', lat: 14.7502, lon: 78.5482 },
    // Telangana gap-fillers
    { id: 'DWLR_IN_TG_03', name: 'Karimnagar - Town', district: 'Karimnagar', state: 'Telangana', lat: 18.4386, lon: 79.1288 },
    { id: 'DWLR_IN_TG_04', name: 'Nizamabad - Town', district: 'Nizamabad', state: 'Telangana', lat: 18.6725, lon: 78.0940 },
    { id: 'DWLR_IN_TG_05', name: 'Khammam - Town', district: 'Khammam', state: 'Telangana', lat: 17.2473, lon: 80.1514 },
    { id: 'DWLR_IN_TG_06', name: 'Nalgonda - Town', district: 'Nalgonda', state: 'Telangana', lat: 17.0500, lon: 79.2671 },
    { id: 'DWLR_IN_TG_07', name: 'Mahbubnagar - Town', district: 'Mahbubnagar', state: 'Telangana', lat: 16.7488, lon: 77.9890 },
    // Maharashtra gap-fillers
    { id: 'DWLR_IN_MH_04', name: 'Kolhapur - Rajarampuri', district: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lon: 74.2433 },
    { id: 'DWLR_IN_MH_05', name: 'Solapur - Town', district: 'Solapur', state: 'Maharashtra', lat: 17.6599, lon: 75.9064 },
    { id: 'DWLR_IN_MH_06', name: 'Sangli - Miraj', district: 'Sangli', state: 'Maharashtra', lat: 16.8524, lon: 74.5815 },
    { id: 'DWLR_IN_MH_07', name: 'Aurangabad - Town', district: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lon: 75.3433 },
    { id: 'DWLR_IN_MH_08', name: 'Nanded - Town', district: 'Nanded', state: 'Maharashtra', lat: 19.1383, lon: 77.3210 },
    // Kerala gap-fillers
    { id: 'DWLR_IN_KL_04', name: 'Thrissur - Town', district: 'Thrissur', state: 'Kerala', lat: 10.5276, lon: 76.2144 },
    { id: 'DWLR_IN_KL_05', name: 'Kollam - Town', district: 'Kollam', state: 'Kerala', lat: 8.8932, lon: 76.6141 },
    { id: 'DWLR_IN_KL_06', name: 'Palakkad - Town', district: 'Palakkad', state: 'Kerala', lat: 10.7867, lon: 76.6548 },
    { id: 'DWLR_IN_KL_07', name: 'Alappuzha - Town', district: 'Alappuzha', state: 'Kerala', lat: 9.4981, lon: 76.3388 },
    { id: 'DWLR_IN_KL_08', name: 'Kottayam - Town', district: 'Kottayam', state: 'Kerala', lat: 9.5916, lon: 76.5222 },
    { id: 'DWLR_IN_KL_09', name: 'Kannur - Town', district: 'Kannur', state: 'Kerala', lat: 11.8745, lon: 75.3704 },
    { id: 'DWLR_IN_KL_10', name: 'Idukki - Thodupuzha', district: 'Idukki', state: 'Kerala', lat: 9.9017, lon: 76.7179 },
    { id: 'DWLR_IN_KL_11', name: 'Malappuram - Town', district: 'Malappuram', state: 'Kerala', lat: 11.0510, lon: 76.0711 },
    // ── Kerala & TN border gap-fillers ──
    // Pathanamthitta-Ranni-Konni area (large empty zone)
    { id: 'DWLR_IN_KL_12', name: 'Pathanamthitta - Town', district: 'Pathanamthitta', state: 'Kerala', lat: 9.2648, lon: 76.7870 },
    { id: 'DWLR_IN_KL_13', name: 'Ranni - Town', district: 'Pathanamthitta', state: 'Kerala', lat: 9.3850, lon: 76.7900 },
    { id: 'DWLR_IN_KL_14', name: 'Konni - Town', district: 'Pathanamthitta', state: 'Kerala', lat: 9.2300, lon: 76.8500 },
    { id: 'DWLR_IN_KL_15', name: 'Adoor - Town', district: 'Pathanamthitta', state: 'Kerala', lat: 9.1553, lon: 76.7301 },
    { id: 'DWLR_IN_KL_16', name: 'Thiruvalla - Town', district: 'Pathanamthitta', state: 'Kerala', lat: 9.3837, lon: 76.5749 },
    // Kollam district interior
    { id: 'DWLR_IN_KL_17', name: 'Kottarakkara - Town', district: 'Kollam', state: 'Kerala', lat: 9.0155, lon: 76.7755 },
    { id: 'DWLR_IN_KL_18', name: 'Punalur - Town', district: 'Kollam', state: 'Kerala', lat: 9.0200, lon: 76.9200 },
    { id: 'DWLR_IN_KL_19', name: 'Karunagappally - Town', district: 'Kollam', state: 'Kerala', lat: 9.0581, lon: 76.5362 },
    // Between Kollam and Thiruvananthapuram
    { id: 'DWLR_IN_KL_20', name: 'Varkala - Beach', district: 'Thiruvananthapuram', state: 'Kerala', lat: 8.7379, lon: 76.7163 },
    { id: 'DWLR_IN_KL_21', name: 'Attingal - Town', district: 'Thiruvananthapuram', state: 'Kerala', lat: 8.6970, lon: 76.8170 },
    { id: 'DWLR_IN_KL_22', name: 'Nedumangad - Town', district: 'Thiruvananthapuram', state: 'Kerala', lat: 8.6020, lon: 77.0000 },
    { id: 'DWLR_IN_KL_23', name: 'Venjaramoodu - Town', district: 'Thiruvananthapuram', state: 'Kerala', lat: 8.6600, lon: 76.9200 },
    { id: 'DWLR_IN_KL_24', name: 'Balaramapuram - Town', district: 'Thiruvananthapuram', state: 'Kerala', lat: 8.3800, lon: 77.0400 },
    // Alappuzha-Kottayam gap
    { id: 'DWLR_IN_KL_25', name: 'Cherthala - Town', district: 'Alappuzha', state: 'Kerala', lat: 9.6800, lon: 76.3400 },
    { id: 'DWLR_IN_KL_26', name: 'Kayamkulam - Town', district: 'Alappuzha', state: 'Kerala', lat: 9.1700, lon: 76.5000 },
    { id: 'DWLR_IN_KL_27', name: 'Haripad - Town', district: 'Alappuzha', state: 'Kerala', lat: 9.2810, lon: 76.4610 },
    // Kottayam district interior
    { id: 'DWLR_IN_KL_28', name: 'Pala - Town', district: 'Kottayam', state: 'Kerala', lat: 9.7140, lon: 76.6840 },
    { id: 'DWLR_IN_KL_29', name: 'Erumely - Town', district: 'Kottayam', state: 'Kerala', lat: 9.5000, lon: 76.8200 },
    { id: 'DWLR_IN_KL_30', name: 'Kanjirappally - Town', district: 'Kottayam', state: 'Kerala', lat: 9.5600, lon: 76.7900 },
    // Ernakulam interior
    { id: 'DWLR_IN_KL_31', name: 'Muvattupuzha - Town', district: 'Ernakulam', state: 'Kerala', lat: 9.9800, lon: 76.5800 },
    { id: 'DWLR_IN_KL_32', name: 'Perumbavoor - Town', district: 'Ernakulam', state: 'Kerala', lat: 10.1100, lon: 76.4700 },
    { id: 'DWLR_IN_KL_33', name: 'Kothamangalam - Town', district: 'Ernakulam', state: 'Kerala', lat: 10.0550, lon: 76.6350 },
    // Idukki interior
    { id: 'DWLR_IN_KL_34', name: 'Munnar - Hill', district: 'Idukki', state: 'Kerala', lat: 10.0889, lon: 77.0595 },
    { id: 'DWLR_IN_KL_35', name: 'Kattappana - Town', district: 'Idukki', state: 'Kerala', lat: 9.7600, lon: 77.0900 },
    // TN side - Srivilliputhur/Rajapalayam area (gap visible)
    { id: 'DWLR_TN_BR01', name: 'Rajapalayam - Town', district: 'Virudhunagar', state: 'Tamil Nadu', lat: 9.4500, lon: 77.5600 },
    { id: 'DWLR_TN_BR02', name: 'Srivilliputhur - Town', district: 'Virudhunagar', state: 'Tamil Nadu', lat: 9.5128, lon: 77.6300 },
    { id: 'DWLR_TN_BR03', name: 'Alangulam - Town', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.8600, lon: 77.5000 },
    { id: 'DWLR_TN_BR04', name: 'Kulasekaram - Town', district: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.3600, lon: 77.3000 },
    { id: 'DWLR_TN_BR05', name: 'Thengapattinam - Coast', district: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.2100, lon: 77.3200 },
    { id: 'DWLR_TN_BR06', name: 'Kuzhithura - Town', district: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.3200, lon: 77.2000 },
    { id: 'DWLR_TN_BR07', name: 'Kadayam - Town', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.9200, lon: 77.3400 },
    { id: 'DWLR_TN_BR08', name: 'Chittar - Town', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.5500, lon: 77.4400 },
    { id: 'DWLR_TN_BR09', name: 'Surandai - Town', district: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.9800, lon: 77.4200 },
    { id: 'DWLR_TN_BR10', name: 'Andipatti - Town', district: 'Theni', state: 'Tamil Nadu', lat: 9.9800, lon: 77.6100 },
    { id: 'DWLR_TN_BR11', name: 'Varusanadu - Town', district: 'Theni', state: 'Tamil Nadu', lat: 9.8700, lon: 77.5100 }
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

  // Force some stations to critical level for realistic dashboard data
  const criticalStationIds = [
    'DWLR_TN_015', 'DWLR_TN_029', 'DWLR_TN_TK1', 'DWLR_TN_RM1',
    'DWLR_TN_GF06', 'DWLR_TN_DL06', 'DWLR_TN_BR08',
    'DWLR_IN_KA_06', 'DWLR_IN_AP_05', 'DWLR_IN_TG_07',
    'DWLR_IN_RJ_02', 'DWLR_IN_MH_05', 'DWLR_IN_KL_22',
    'DWLR_IN_UP_03', 'DWLR_IN_BR_01'
  ];
  criticalStationIds.forEach(id => {
    const station = stations.get(id);
    if (!station) return;
    const stationReadings = readings.get(id);
    if (!stationReadings || stationReadings.length === 0) return;
    // Set last 5 days of readings to critical levels
    const critLevel = station.criticalThreshold;
    for (let i = Math.max(0, stationReadings.length - 20); i < stationReadings.length; i++) {
      stationReadings[i].level = parseFloat((critLevel * (0.5 + Math.random() * 0.45)).toFixed(2));
    }
  });

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

// Highest water point level per state (across all stations in India)
export function getHighestWaterLevelByState() {
  const stateMaxMap = {}; // state -> { maxLevel, stationName, stationId, district }

  for (const [stationId, station] of stations) {
    const stationReadings = readings.get(stationId) || [];
    if (stationReadings.length === 0) continue;

    // Find the highest reading for this station
    let maxReading = stationReadings[0];
    for (const r of stationReadings) {
      if (r.level > maxReading.level) maxReading = r;
    }

    const state = station.state;
    if (!stateMaxMap[state] || maxReading.level > stateMaxMap[state].maxLevel) {
      stateMaxMap[state] = {
        state,
        maxLevel: parseFloat(maxReading.level.toFixed(2)),
        stationId: station.id,
        stationName: station.name,
        district: station.district,
        recordedAt: maxReading.ts
      };
    }
  }

  // Convert to sorted array
  return Object.values(stateMaxMap).sort((a, b) => b.maxLevel - a.maxLevel);
}

// Get stations by status (normal, warning, critical)
export function getStationsByStatus(targetStatus) {
  const allStns = Array.from(stations.values());
  const result = [];

  allStns.forEach(station => {
    const latest = getLatestReading(station.id);
    if (!latest) return;
    const status = classifyLevel(latest.level, station);
    if (status === targetStatus) {
      result.push({
        id: station.id,
        name: station.name,
        state: station.state,
        district: station.district,
        lat: station.lat,
        lon: station.lon,
        latestLevel: parseFloat(latest.level.toFixed(2)),
        normalThreshold: parseFloat(station.normalThreshold.toFixed(2)),
        warningThreshold: parseFloat(station.warningThreshold.toFixed(2)),
        criticalThreshold: parseFloat(station.criticalThreshold.toFixed(2)),
        lastSeen: latest.ts
      });
    }
  });

  // Sort: critical by level asc, normal by level desc, warning by level asc
  if (targetStatus === 'critical') {
    result.sort((a, b) => a.latestLevel - b.latestLevel);
  } else {
    result.sort((a, b) => b.latestLevel - a.latestLevel);
  }
  return result;
}
