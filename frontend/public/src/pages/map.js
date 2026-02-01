import { requireAuth, logout } from '../modules/auth.js';
import { api } from '../modules/api.js';

if (!requireAuth()) {
    window.location.href = '/index.html';
} else {
    initMapPage();
}

function initMapPage() {
// Attach logout handler as soon as DOM is ready (works even if Leaflet fails or is slow)
function setupLogout() {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLogout);
} else {
    setupLogout();
}

// Load Leaflet dynamically so we know exactly when it's ready (avoids race with module execution)
function loadLeafletThenInit() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    if (typeof L !== 'undefined') {
        runMapInit();
        return;
    }

    mapContainer.innerHTML = '<div class="map-loading">Loading map library...</div>';

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => runMapInit();
    script.onerror = () => {
        mapContainer.innerHTML = '<div style="padding: 2rem; text-align: center;"><p>Error: Map library failed to load.</p><p>Check your internet connection or try again later.</p></div>';
    };
    document.head.appendChild(script);
}

function runMapInit() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof L === 'undefined') {
        if (mapContainer) mapContainer.innerHTML = '<div style="padding: 2rem; text-align: center;"><p>Error: Map library not available.</p></div>';
        return;
    }

    mapContainer.innerHTML = '';

    // Initialize map centered on India (all states)
    const map = L.map('map').setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    }).addTo(map);

    // Title overlay: India – all states
    const titleControl = L.control({ position: 'topleft' });
    titleControl.onAdd = function () {
        const div = document.createElement('div');
        div.className = 'map-title-control';
        div.innerHTML = '<strong>India – All states</strong><br><span style="font-size: 11px;">Groundwater levels (m) · TN: Namakkal, Erode, Vellore, Chennai + cities</span>';
        div.style.cssText = 'padding: 6px 10px; background: rgba(255,255,255,0.95); border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.2); font-size: 13px; line-height: 1.3;';
        return div;
    };
    titleControl.addTo(map);

    // Color mapping for status
    const statusColors = {
        normal: '#10b981',
        warning: '#f59e0b',
        critical: '#ef4444',
        unknown: '#94a3b8'
    };

    // Create icon with water level label (for Tamil Nadu stations)
    function createIconWithLevel(status, levelM) {
        const color = statusColors[status] || statusColors.unknown;
        const levelText = levelM !== null && levelM !== undefined ? levelM.toFixed(1) + ' m' : '—';
        return L.divIcon({
            className: 'custom-marker-with-level',
            html: `
                <div style="display: flex; flex-direction: column; align-items: center; line-height: 1;">
                    <div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
                    <span style="font-size: 10px; font-weight: 600; color: #1e293b; white-space: nowrap; margin-top: 2px; text-shadow: 0 0 2px white, 0 0 2px white;">${levelText}</span>
                </div>
            `,
            iconSize: [36, 28],
            iconAnchor: [18, 14]
        });
    }

    let markers = [];

    async function loadStations() {
        try {
            // Clear existing markers
            markers.forEach(m => map.removeLayer(m));
            markers = [];

            // Load all stations (all states in India)
            const response = await api.getStations({ limit: 2000 });
            if (!response || !response.stations) {
                console.warn('No stations data received');
                return;
            }

            response.stations.forEach(station => {
                const marker = L.marker([station.lat, station.lon], {
                    icon: createIconWithLevel(station.status, station.latestLevel)
                }).addTo(map);

                marker.bindPopup(`
                    <div style="min-width: 200px;">
                        <h3 style="margin: 0 0 0.5rem 0;">${station.name}</h3>
                        <p style="margin: 0.25rem 0;"><strong>Water level:</strong> ${station.latestLevel !== null ? station.latestLevel.toFixed(2) + ' m' : 'N/A'}</p>
                        <p style="margin: 0.25rem 0;"><strong>Status:</strong> <span style="color: ${statusColors[station.status]}">${station.status.toUpperCase()}</span></p>
                        <p style="margin: 0.25rem 0;"><strong>Location:</strong> ${station.district}, ${station.state}</p>
                        <a href="station.html?id=${station.id}" style="display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem; background: #2563eb; color: white; text-decoration: none; border-radius: 4px;">View Details</a>
                    </div>
                `);

                markers.push(marker);
            });

            // Fit bounds to all India markers
            if (markers.length > 0) {
                const group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds().pad(0.08));
            } else {
                console.warn('No stations to display');
            }
        } catch (error) {
            console.error('Failed to load stations:', error);
            document.getElementById('map').innerHTML = `<div style="padding: 2rem; text-align: center;"><p>Error loading stations: ${error.message}</p><p>Please check your connection and try again.</p></div>`;
        }
    }

    // Load stations on page load
    loadStations();
}

// Start map flow when DOM is ready
function startMap() {
    loadLeafletThenInit();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMap);
} else {
    startMap();
}
} // end initMapPage
