-- PostgreSQL Schema for Groundwater Monitoring System
-- Optimized for time-series data with partitioning

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Stations table
CREATE TABLE stations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    lat NUMERIC(10, 6) NOT NULL,
    lon NUMERIC(10, 6) NOT NULL,
    elevation NUMERIC(8, 2),
    metadata JSONB DEFAULT '{}',
    normal_threshold NUMERIC(8, 2) NOT NULL,
    warning_threshold NUMERIC(8, 2) NOT NULL,
    critical_threshold NUMERIC(8, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for stations
CREATE INDEX idx_stations_state ON stations(state);
CREATE INDEX idx_stations_district ON stations(district);
CREATE INDEX idx_stations_location ON stations USING GIST (point(lon, lat));
CREATE INDEX idx_stations_metadata ON stations USING GIN (metadata);

-- Readings table (partitioned by month for performance)
CREATE TABLE readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id VARCHAR(50) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    ts TIMESTAMP WITH TIME ZONE NOT NULL,
    level NUMERIC(8, 2) NOT NULL,
    qc TEXT NOT NULL DEFAULT 'OK',
    raw JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(station_id, ts)
) PARTITION BY RANGE (ts);

-- Create partitions for current and next 3 months
-- Note: In production, use a script to auto-create partitions
CREATE TABLE readings_2026_01 PARTITION OF readings
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE readings_2026_02 PARTITION OF readings
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE readings_2026_03 PARTITION OF readings
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE readings_2026_04 PARTITION OF readings
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- Indexes for readings (on each partition automatically)
CREATE INDEX idx_readings_station_ts ON readings(station_id, ts DESC);
CREATE INDEX idx_readings_ts ON readings(ts DESC);
CREATE INDEX idx_readings_qc ON readings(qc) WHERE qc != 'OK';

-- BRIN index for large time-series (efficient for sequential data)
CREATE INDEX idx_readings_ts_brin ON readings USING BRIN (ts);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Researcher', 'Planner', 'Admin')),
    region_restrictions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id VARCHAR(50) REFERENCES stations(id) ON DELETE CASCADE,
    region JSONB, -- {state: "...", district: "..."} or null for station-specific
    threshold NUMERIC(8, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'critical', 'warning', 'recharge'
    enabled BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_station ON alerts(station_id) WHERE station_id IS NOT NULL;
CREATE INDEX idx_alerts_region ON alerts USING GIN (region);
CREATE INDEX idx_alerts_enabled ON alerts(enabled) WHERE enabled = true;

-- Alert history (for tracking triggered alerts)
CREATE TABLE alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    station_id VARCHAR(50) NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    level NUMERIC(8, 2) NOT NULL,
    threshold NUMERIC(8, 2) NOT NULL,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_alert_history_station ON alert_history(station_id, triggered_at DESC);
CREATE INDEX idx_alert_history_acknowledged ON alert_history(acknowledged) WHERE acknowledged = false;

-- Materialized view for latest readings per station (refresh periodically)
CREATE MATERIALIZED VIEW latest_readings AS
SELECT DISTINCT ON (station_id)
    station_id,
    ts,
    level,
    qc
FROM readings
ORDER BY station_id, ts DESC;

CREATE UNIQUE INDEX idx_latest_readings_station ON latest_readings(station_id);

-- Function to refresh latest_readings view
CREATE OR REPLACE FUNCTION refresh_latest_readings()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY latest_readings;
END;
$$ LANGUAGE plpgsql;

-- Function to get station status
CREATE OR REPLACE FUNCTION get_station_status(p_station_id VARCHAR)
RETURNS TEXT AS $$
DECLARE
    v_level NUMERIC;
    v_normal_threshold NUMERIC;
    v_warning_threshold NUMERIC;
    v_critical_threshold NUMERIC;
BEGIN
    SELECT lr.level, s.normal_threshold, s.warning_threshold, s.critical_threshold
    INTO v_level, v_normal_threshold, v_warning_threshold, v_critical_threshold
    FROM latest_readings lr
    JOIN stations s ON s.id = lr.station_id
    WHERE lr.station_id = p_station_id;

    IF v_level IS NULL THEN
        RETURN 'unknown';
    END IF;

    IF v_level <= v_critical_threshold THEN
        RETURN 'critical';
    ELSIF v_level <= v_warning_threshold THEN
        RETURN 'warning';
    ELSE
        RETURN 'normal';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Sample queries for common operations

-- Get latest reading per station with status
-- SELECT 
--     s.id,
--     s.name,
--     s.state,
--     s.district,
--     s.lat,
--     s.lon,
--     lr.level as latest_level,
--     lr.ts as last_seen,
--     get_station_status(s.id) as status
-- FROM stations s
-- LEFT JOIN latest_readings lr ON s.id = lr.station_id
-- ORDER BY s.id;

-- Get time series for a station (daily aggregation)
-- SELECT 
--     DATE_TRUNC('day', ts) as day,
--     AVG(level) as avg_level,
--     MIN(level) as min_level,
--     MAX(level) as max_level,
--     COUNT(*) as reading_count
-- FROM readings
-- WHERE station_id = 'DWLR_001'
--     AND ts >= '2026-01-01'::timestamp
--     AND ts < '2026-01-31'::timestamp
-- GROUP BY DATE_TRUNC('day', ts)
-- ORDER BY day;

-- Bulk insert example (using COPY for high throughput)
-- COPY readings(station_id, ts, level, qc, raw)
-- FROM '/path/to/csv/file'
-- WITH (FORMAT csv, HEADER true);
