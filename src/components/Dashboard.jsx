import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const Dashboard = ({
  user,
  onNavigateToAlerts,
  onNavigateToLogs,
  onNavigateBack,
  onLogout
}) => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const severityColors = {
    LOW: 'bg-green-500/20 text-green-400 border border-green-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/30'
  };

  const severityLabels = {
    LOW: '🟢 LOW',
    MEDIUM: '🟡 MEDIUM',
    HIGH: '🟠 HIGH',
    CRITICAL: '🔴 CRITICAL'
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // ✅ Stats
      const statsRes = await fetch(`${API_URL}/api/logs/stats/`, { headers });
      if (statsRes.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      const statsData = await statsRes.json();
      setStats(statsData);

      // ✅ Alerts
      const url = filter === 'ALL' ? '/api/alerts/' : `/api/alerts/?severity=${filter}`;
      const alertsRes = await fetch(`${API_URL}${url}`, { headers });
      if (alertsRes.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      const alertsData = await alertsRes.json();
      let alertsArray = [];
      if (Array.isArray(alertsData)) {
        alertsArray = alertsData;
      } else if (alertsData.results) {
        alertsArray = alertsData.results;
      } else if (alertsData.alerts) {
        alertsArray = alertsData.alerts;
      }
      setAlerts(alertsArray);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#f59e0b] text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateBack}
              className="px-4 py-2 bg-[#1a1a1a] text-gray-400 rounded-lg hover:bg-[#2a2a2a] transition text-sm border border-[#2a2a2a]"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-white">📊 Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">👤 {user?.username || 'User'}</span>
            <button
              onClick={onNavigateToLogs}
              className="px-4 py-2 bg-[#f59e0b]/20 text-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/30 transition text-sm border border-[#f59e0b]/30"
            >
              📁 View Logs
            </button>
            <button
              onClick={onNavigateToAlerts}
              className="px-4 py-2 bg-[#f59e0b]/20 text-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/30 transition text-sm border border-[#f59e0b]/30"
            >
              🚨 View Alerts
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/30">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Log Files', value: stats?.total_logs || 0 },
            { label: 'Total Entries', value: stats?.total_entries || 0 },
            { label: 'Total Alerts', value: stats?.total_alerts || 0, yellow: true },
            { label: 'Critical Alerts', value: stats?.critical_alerts || 0, red: true }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a]">
              <p className="text-gray-500 text-sm">{item.label}</p>
              <p className={`text-3xl font-bold ${item.yellow ? 'text-[#f59e0b]' : item.red ? 'text-red-500' : 'text-white'}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === sev
                  ? 'bg-[#f59e0b] text-[#0a0a0a]'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] border border-[#2a2a2a]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
          <div className="p-4 border-b border-[#2a2a2a]">
            <h2 className="text-xl font-semibold text-white">🚨 Alerts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a0a0a]">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Severity</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Message</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No alerts found. Upload a log file to generate alerts.
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert) => (
                    <tr key={alert.id} className="border-t border-[#2a2a2a]">
                      <td className="px-4 py-3 text-gray-400">
                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[alert.severity] || severityColors.LOW}`}>
                          {severityLabels[alert.severity] || alert.severity || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{alert.message}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          alert.is_resolved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {alert.is_resolved ? '✅ Resolved' : '⏳ Open'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;