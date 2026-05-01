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

    async function loadDashboard() {
        try {
            const summary = await api.getDashboardSummary();
            if (!summary) return;

            document.getElementById('totalStations').textContent = summary.totalStations;
            document.getElementById('avgLevel').textContent = summary.avgLevel.toFixed(2);
            document.getElementById('normalCount').textContent = summary.normalCount;
            document.getElementById('warningCount').textContent = summary.warningCount;
            document.getElementById('criticalCount').textContent = summary.criticalCount;
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    }

    document.getElementById('refreshBtn').addEventListener('click', loadDashboard);
    document.getElementById('refreshInterval').addEventListener('change', (e) => {
        if (refreshIntervalId) clearInterval(refreshIntervalId);
        refreshIntervalId = null;
        const ms = parseInt(e.target.value, 10);
        if (ms > 0) refreshIntervalId = setInterval(loadDashboard, ms);
    });

    loadDashboard();

    const ms = parseInt(document.getElementById('refreshInterval').value, 10);
    if (ms > 0) refreshIntervalId = setInterval(loadDashboard, ms);
}
