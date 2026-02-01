# Groundwater Monitoring System - India DWLR Stations

A production-grade, responsive web application for real-time groundwater monitoring using DWLR station data. This is a minimal prototype demonstrating core functionality.

## Architecture Summary

The system follows a three-tier architecture: **Frontend** (static HTML/CSS/ES6 modules), **Backend** (Node.js/Express REST API with JWT authentication), and **Database** (PostgreSQL with time-series optimization). The frontend is mobile-first, PWA-ready, and uses Chart.js for visualizations and Leaflet for mapping. The backend implements role-based access control (Researcher, Planner, Admin), bulk ingestion endpoints, and business logic for groundwater classification and recharge estimation. For the prototype, an in-memory data store is used, but production-ready PostgreSQL DDL is provided.

## Quick Start (Local Development)

### Prerequisites
- Node.js >= 18
- npm or yarn

### Setup Steps

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   
   cd ../frontend
   npm install
   ```

2. **Configure environment (backend/.env):**
   ```env
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   DB_URL=postgresql://user:pass@localhost:5432/groundwater
   REDIS_URL=redis://localhost:6379
   ```

3. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on http://localhost:3000

4. **Serve the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on http://localhost:8080 (or use any static server)

   Alternatively, the backend serves static files from `frontend/public` when running.

5. **Access the application:**
   - Open http://localhost:3000 (or http://localhost:8080 if using frontend dev server)
   - Login with:
     - Username: `researcher`, Password: `researcher123` (Role: Researcher)
     - Username: `planner`, Password: `planner123` (Role: Planner)
     - Username: `admin`, Password: `admin123` (Role: Admin)

## API Endpoints

### Authentication

**POST /auth/login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"researcher","password":"researcher123"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "Researcher",
  "expiresIn": 3600
}
```

### Stations

**GET /stations**
```bash
curl -X GET "http://localhost:3000/stations?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**GET /stations/:id**
```bash
curl -X GET "http://localhost:3000/stations/DWLR_001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**GET /stations/:id/timeseries**
```bash
curl -X GET "http://localhost:3000/stations/DWLR_001/timeseries?from=2026-01-01T00:00:00Z&to=2026-01-30T23:59:59Z&interval=daily" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Example Response:
```json
{
  "stationId": "DWLR_001",
  "from": "2026-01-01T00:00:00.000Z",
  "to": "2026-01-30T23:59:59.000Z",
  "interval": "daily",
  "page": 1,
  "limit": 1000,
  "total": 30,
  "data": [
    {
      "ts": "2026-01-01T00:00:00Z",
      "level": 12.45,
      "qc": "OK",
      "count": 4
    }
  ],
  "aggregates": {
    "avgLevel": 12.34,
    "minLevel": 11.20,
    "maxLevel": 13.50,
    "count": 30
  }
}
```

### Ingestion

**POST /ingest**
```bash
curl -X POST http://localhost:3000/ingest \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "DWLR_001",
    "readings": [
      {"ts": "2026-01-30T10:00:00Z", "level": 12.34, "qc": "OK"},
      {"ts": "2026-01-30T10:15:00Z", "level": 12.30, "qc": "OK"}
    ]
  }'
```

Example Response:
```json
{
  "stationId": "DWLR_001",
  "inserted": 2,
  "rejected": 0,
  "errors": [],
  "timestamp": "2026-01-30T10:30:00.000Z"
}
```

**GET /stations** (Example Response):
```json
{
  "page": 1,
  "limit": 50,
  "total": 60,
  "stations": [
    {
      "id": "DWLR_001",
      "name": "Station 1 - Mumbai",
      "state": "Maharashtra",
      "district": "Mumbai",
      "lat": 19.0760,
      "lon": 72.8777,
      "status": "warning",
      "latestLevel": 12.3,
      "lastSeen": "2026-01-30T10:15:00Z"
    }
  ]
}
```

## Docker Setup (Recommended for Local Development)

1. **Start services with Docker Compose:**
   ```bash
   docker-compose up -d
   ```
   This starts PostgreSQL (TimescaleDB), Redis, and the API service.

2. **Access the application:**
   - API: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## Database Setup (PostgreSQL)

The prototype uses in-memory storage. For production, use PostgreSQL:

1. **Create database:**
   ```sql
   CREATE DATABASE groundwater;
   ```

2. **Run schema (see `database/schema.sql`):**
   ```bash
   psql -U postgres -d groundwater -f database/schema.sql
   ```

3. **Update backend/.env with your DB_URL**

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── index.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── dashboard.html
│   │   ├── map.html
│   │   ├── station.html
│   │   └── assets/
│   ├── src/
│   │   ├── modules/
│   │   └── pages/
│   └── package.json
├── database/
│   └── schema.sql
└── README.md
```

## Testing

Run backend tests:
```bash
cd backend
npm test
```

## Security Notes

- Change JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting (configured in middleware)
- Validate all inputs
- Use parameterized queries (implemented)

## Next Steps

- [ ] Implement PostgreSQL adapter
- [ ] Add Redis caching
- [ ] Deploy service worker for PWA
- [ ] Add comprehensive integration tests
- [ ] Set up monitoring and logging
