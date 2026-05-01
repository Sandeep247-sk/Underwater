import { requireAuth, logout } from '../modules/auth.js';
import { api } from '../modules/api.js';

if (!requireAuth()) {
    window.location.href = '/index.html';
} else {
    runDashboard();
}

function runDashboard() {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    let refreshIntervalId = null;
    let activeStatus = 'critical';

    // --- KPI loading ---
    async function loadDashboard() {
        try {
            const summary = await api.getDashboardSummary();
            if (!summary) return;

            document.getElementById('totalStations').textContent = summary.totalStations;
            document.getElementById('avgLevel').textContent = summary.avgLevel.toFixed(2);
            document.getElementById('normalCount').textContent = summary.normalCount;
            document.getElementById('warningCount').textContent = summary.warningCount;
            document.getElementById('criticalCount').textContent = summary.criticalCount;

            // Update tab badges
            document.getElementById('tabCriticalCount').textContent = summary.criticalCount;
            document.getElementById('tabWarningCount').textContent = summary.warningCount;
            document.getElementById('tabNormalCount').textContent = summary.normalCount;
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    }

    // --- Status table helpers ---
    const statusConfig = {
        critical: {
            icon: '🔴',
            levelClass: 'level-high',
            thresholdLabel: 'Critical Threshold',
            thresholdKey: 'criticalThreshold',
            theadBg: 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
            rowHover: '#fef2f2',
            emptyMsg: 'No critical stations — all stations operating above critical levels.'
        },
        warning: {
            icon: '🟡',
            levelClass: 'level-medium',
            thresholdLabel: 'Warning Threshold',
            thresholdKey: 'warningThreshold',
            theadBg: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
            rowHover: '#fffbeb',
            emptyMsg: 'No warning stations — all stations are normal or critical.'
        },
        normal: {
            icon: '🟢',
            levelClass: 'level-normal',
            thresholdLabel: 'Normal Threshold',
            thresholdKey: 'normalThreshold',
            theadBg: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
            rowHover: '#f0fdf4',
            emptyMsg: 'No normal stations found.'
        }
    };

    async function loadStationsByStatus(status) {
        const loadingEl = document.getElementById('statusLoading');
        const wrapperEl = document.getElementById('statusWrapper');
        const bodyEl = document.getElementById('statusBody');
        const emptyEl = document.getElementById('statusEmpty');
        const theadEl = document.getElementById('statusThead');
        const config = statusConfig[status];

        // Show loading, hide table
        if (loadingEl) loadingEl.style.display = 'block';
        if (wrapperEl) wrapperEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'none';

        try {
            const response = await api.getStationsByStatus(status);
            if (!response || !response.stations) {
                if (loadingEl) loadingEl.textContent = 'Failed to load stations.';
                return;
            }

            if (loadingEl) loadingEl.style.display = 'none';

            if (response.stations.length === 0) {
                if (emptyEl) {
                    emptyEl.textContent = config.emptyMsg;
                    emptyEl.style.display = 'block';
                }
                return;
            }

            // Update thead color
            if (theadEl) theadEl.style.background = config.theadBg;

            bodyEl.innerHTML = '';
            response.stations.forEach((station, index) => {
                const date = new Date(station.lastSeen);
                const dateStr = date.toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                const thresholdValue = station[config.thresholdKey];
                const row = document.createElement('tr');
                row.className = `status-row status-row--${status}`;
                row.innerHTML = `
                    <td class="rank-cell">${index + 1}</td>
                    <td class="station-cell">
                        <span class="critical-icon">${config.icon}</span>
                        <a href="station.html?id=${station.id}" class="station-link">${station.name}</a>
                    </td>
                    <td><span class="state-name">${station.state}</span></td>
                    <td>${station.district}</td>
                    <td class="level-cell">
                        <span class="level-badge ${config.levelClass}">${station.latestLevel} m</span>
                    </td>
                    <td class="level-cell">
                        <span class="level-badge level-threshold">${thresholdValue} m</span>
                    </td>
                    <td class="date-cell">${dateStr}</td>
                    <td class="actions-cell">
                        <a href="station.html?id=${station.id}" class="action-btn action-detail" title="View Details">📊</a>
                        <a href="map.html" class="action-btn action-map" title="View on Map">🗺️</a>
                    </td>
                `;
                bodyEl.appendChild(row);
            });

            if (wrapperEl) wrapperEl.style.display = 'block';
        } catch (error) {
            console.error(`Failed to load ${status} stations:`, error);
            if (loadingEl) loadingEl.textContent = 'Failed to load stations.';
        }
    }

    // --- Tab switching ---
    document.querySelectorAll('.status-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeStatus = tab.dataset.status;
            loadStationsByStatus(activeStatus);
        });
    });

    // --- Refresh ---
    function refreshAll() {
        loadDashboard();
        loadStationsByStatus(activeStatus);
    }

    document.getElementById('refreshBtn').addEventListener('click', refreshAll);
    document.getElementById('refreshInterval').addEventListener('change', (e) => {
        if (refreshIntervalId) clearInterval(refreshIntervalId);
        refreshIntervalId = null;
        const ms = parseInt(e.target.value, 10);
        if (ms > 0) refreshIntervalId = setInterval(refreshAll, ms);
    });

    refreshAll();

    const ms = parseInt(document.getElementById('refreshInterval').value, 10);
    if (ms > 0) refreshIntervalId = setInterval(refreshAll, ms);
}
