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
    const sparklineIds = ['sparkline0', 'sparkline1', 'sparkline2', 'sparkline3', 'sparkline4'];
    const sparklineCharts = {};

    const sparklineDefaults = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            scales: { x: { display: false }, y: { display: false } }
        }
    };

    function initSparklines() {
        const colors = [
            { border: '#64748b', fill: 'rgba(100, 116, 139, 0.1)' },
            { border: '#2563eb', fill: 'rgba(37, 99, 235, 0.1)' },
            { border: '#10b981', fill: 'rgba(16, 185, 129, 0.1)' },
            { border: '#f59e0b', fill: 'rgba(245, 158, 11, 0.1)' },
            { border: '#ef4444', fill: 'rgba(239, 68, 68, 0.1)' }
        ];
        sparklineIds.forEach((id, i) => {
            const ctx = document.getElementById(id);
            if (!ctx) return;
            sparklineCharts[id] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        borderColor: colors[i].border,
                        backgroundColor: colors[i].fill,
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: sparklineDefaults.options
            });
        });
    }

    function updateSparkline(chartId, data, labels) {
        if (!sparklineCharts[chartId]) return;
        sparklineCharts[chartId].data.labels = labels || data.map((_, i) => i);
        sparklineCharts[chartId].data.datasets[0].data = data;
        sparklineCharts[chartId].update();
    }

    async function loadDashboard() {
        try {
            const summary = await api.getDashboardSummary();
            if (!summary) return;

            document.getElementById('totalStations').textContent = summary.totalStations;
            document.getElementById('avgLevel').textContent = summary.avgLevel.toFixed(2);
            document.getElementById('normalCount').textContent = summary.normalCount;
            document.getElementById('warningCount').textContent = summary.warningCount;
            document.getElementById('criticalCount').textContent = summary.criticalCount;

            const trend = summary.trend || [];
            if (trend.length > 0) {
                const labels = trend.map(t => {
                    const d = new Date(t.date);
                    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                });
                updateSparkline('sparkline0', trend.map(() => summary.totalStations), labels);
                updateSparkline('sparkline1', trend.map(t => t.avgLevel != null ? t.avgLevel : summary.avgLevel), labels);
                updateSparkline('sparkline2', trend.map(t => t.normalCount), labels);
                updateSparkline('sparkline3', trend.map(t => t.warningCount), labels);
                updateSparkline('sparkline4', trend.map(t => t.criticalCount), labels);
            }
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

    initSparklines();
    loadDashboard();

    const ms = parseInt(document.getElementById('refreshInterval').value, 10);
    if (ms > 0) refreshIntervalId = setInterval(loadDashboard, ms);
}
