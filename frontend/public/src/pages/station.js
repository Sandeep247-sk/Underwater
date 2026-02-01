import { requireAuth, logout } from '../modules/auth.js';
import { api } from '../modules/api.js';

if (!requireAuth()) {
    window.location.href = '/index.html';
} else {
    runStationPage();
}

function runStationPage() {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const stationId = urlParams.get('id');

    if (!stationId) {
        window.location.href = '/map.html';
        return;
    }

    let timeseriesChart = null;
    let stationData = null;

    function initChart(thresholds) {
        const ctx = document.getElementById('timeseriesChart');
        if (!ctx) return;

        const datasets = [
            {
                label: 'Water Level (m)',
                data: [],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 5
            }
        ];

        if (thresholds) {
            if (thresholds.normal != null) {
                datasets.push({
                    label: 'Normal threshold',
                    data: [],
                    borderColor: '#10b981',
                    borderWidth: 1.5,
                    borderDash: [6, 4],
                    fill: false,
                    pointRadius: 0
                });
            }
            if (thresholds.warning != null) {
                datasets.push({
                    label: 'Warning threshold',
                    data: [],
                    borderColor: '#f59e0b',
                    borderWidth: 1.5,
                    borderDash: [6, 4],
                    fill: false,
                    pointRadius: 0
                });
            }
            if (thresholds.critical != null) {
                datasets.push({
                    label: 'Critical threshold',
                    data: [],
                    borderColor: '#ef4444',
                    borderWidth: 1.5,
                    borderDash: [6, 4],
                    fill: false,
                    pointRadius: 0
                });
            }
        }

        timeseriesChart = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Date' },
                        ticks: { maxRotation: 45, minRotation: 45, maxTicksLimit: 15 }
                    },
                    y: {
                        title: { display: true, text: 'Level (m)' },
                        beginAtZero: false
                    }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
    }

    async function loadStation() {
        try {
            const station = await api.getStation(stationId);
            if (!station) {
                window.location.href = '/map.html';
                return;
            }
            stationData = station;

            document.getElementById('stationName').textContent = station.name;
            document.getElementById('stationLocation').textContent = `${station.district}, ${station.state}`;

            const statusBadge = document.getElementById('stationStatus');
            statusBadge.textContent = station.status.toUpperCase();
            statusBadge.className = `status-badge ${station.status}`;

            document.getElementById('currentLevel').textContent = station.latestLevel != null
                ? `${station.latestLevel.toFixed(2)} m`
                : '--';

            const thresholds = station.normalThreshold != null ? {
                normal: station.normalThreshold,
                warning: station.warningThreshold,
                critical: station.criticalThreshold
            } : null;

            if (!timeseriesChart) initChart(thresholds);
            loadTimeSeries(thresholds);
        } catch (error) {
            console.error('Failed to load station:', error);
        }
    }

    function formatDateLabel(ts, interval) {
        const date = new Date(ts);
        if (interval === 'weekly') {
            return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' });
        }
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }

    async function loadTimeSeries(thresholdsFromStation) {
        const loadingEl = document.getElementById('chartLoading');
        const emptyEl = document.getElementById('chartEmpty');
        if (loadingEl) loadingEl.style.display = 'block';
        if (emptyEl) emptyEl.style.display = 'none';

        try {
            const fromDate = document.getElementById('fromDate').value;
            const toDate = document.getElementById('toDate').value;
            const interval = document.getElementById('intervalSelect').value;

            const response = await api.getTimeSeries(stationId, {
                from: `${fromDate}T00:00:00Z`,
                to: `${toDate}T23:59:59Z`,
                interval
            });

            if (loadingEl) loadingEl.style.display = 'none';

            if (!response || !response.data || response.data.length === 0) {
                if (timeseriesChart) {
                    timeseriesChart.data.labels = [];
                    timeseriesChart.data.datasets.forEach(ds => { ds.data = []; });
                    timeseriesChart.update();
                }
                if (emptyEl) emptyEl.style.display = 'block';
                document.getElementById('avgLevel').textContent = '--';
                document.getElementById('minLevel').textContent = '--';
                document.getElementById('maxLevel').textContent = '--';
                return;
            }

            const data = response.data;
            const labels = data.map(d => formatDateLabel(d.ts, interval));
            const levels = data.map(d => d.level);

            timeseriesChart.data.labels = labels;
            timeseriesChart.data.datasets[0].data = levels;

            const thresholds = thresholdsFromStation || (stationData && stationData.normalThreshold != null
                ? {
                    normal: stationData.normalThreshold,
                    warning: stationData.warningThreshold,
                    critical: stationData.criticalThreshold
                }
                : null);

            if (thresholds && timeseriesChart.data.datasets.length > 1) {
                const n = data.length;
                timeseriesChart.data.datasets[1].data = thresholds.normal != null ? Array(n).fill(thresholds.normal) : [];
                timeseriesChart.data.datasets[2].data = thresholds.warning != null ? Array(n).fill(thresholds.warning) : [];
                timeseriesChart.data.datasets[3].data = thresholds.critical != null ? Array(n).fill(thresholds.critical) : [];
            }

            timeseriesChart.update();

            if (response.aggregates) {
                document.getElementById('avgLevel').textContent = `${response.aggregates.avgLevel.toFixed(2)} m`;
                document.getElementById('minLevel').textContent = `${response.aggregates.minLevel.toFixed(2)} m`;
                document.getElementById('maxLevel').textContent = `${response.aggregates.maxLevel.toFixed(2)} m`;
            }

            const rangeEl = document.getElementById('chartDateRange');
            if (rangeEl) {
                rangeEl.textContent = `${formatDateLabel(data[0].ts, interval)} – ${formatDateLabel(data[data.length - 1].ts, interval)}`;
            }
        } catch (error) {
            if (loadingEl) loadingEl.style.display = 'none';
            if (emptyEl) {
                emptyEl.textContent = 'Failed to load time series. Try again.';
                emptyEl.style.display = 'block';
            }
            console.error('Failed to load time series:', error);
        }
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    document.getElementById('fromDate').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('toDate').value = today.toISOString().split('T')[0];

    document.getElementById('updateChart').addEventListener('click', () => loadTimeSeries());

    loadStation();
}
