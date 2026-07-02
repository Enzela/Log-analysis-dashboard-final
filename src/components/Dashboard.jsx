import { useState, useEffect } from 'react';

const Dashboard = ({ 
  user, 
  onNavigateToAlerts, 
  onNavigateToLogs,      // ✅ New prop
  onNavigateBack, 
  onLogout 
}) => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const severityColors = {
    LOW: 'bg-green-500/20 text-green-400',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400',
    HIGH: 'bg-orange-500/20 text-orange-400',
    CRITICAL: 'bg-red-500/20 text-red-400'
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Stats
      const statsRes = await fetch('/api/logs/stats/', { headers });
      if (statsRes.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      const statsData = await statsRes.json();
      setStats(statsData);

      // Alerts
      const url = filter === 'ALL' ? '/api/alerts/' : `/api/alerts/?severity=${filter}`;
      const alertsRes = await fetch(url, { headers });
      if (alertsRes.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      const alertsData = await alertsRes.json();
      setAlerts(Array.isArray(alertsData) ? alertsData : alertsData.alerts || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-[#00d4ff] text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateBack}
              className="px-4 py-2 bg-[#1a2332] text-gray-400 rounded-lg hover:bg-[#243447] transition text-sm"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-white">📊 Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">👤 {user?.name || user?.username || 'User'}</span>
            {/* ✅ New Button: View Logs */}
            <button
              onClick={onNavigateToLogs}
              className="px-4 py-2 bg-[#f59e0b]/20 text-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/30 transition text-sm"
            >
              📁 View Logs
            </button>
            <button
              onClick={onNavigateToAlerts}
              className="px-4 py-2 bg-[#00d4ff]/20 text-[#00d4ff] rounded-lg hover:bg-[#00d4ff]/30 transition text-sm"
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111b28] p-6 rounded-xl border border-[#1a2332]">
            <p className="text-gray-500 text-sm">Total Log Files</p>
            <p className="text-3xl font-bold text-white">{stats?.total_logs || 0}</p>
          </div>
          <div className="bg-[#111b28] p-6 rounded-xl border border-[#1a2332]">
            <p className="text-gray-500 text-sm">Total Entries</p>
            <p className="text-3xl font-bold text-white">{stats?.total_entries || 0}</p>
          </div>
          <div className="bg-[#111b28] p-6 rounded-xl border border-[#1a2332]">
            <p className="text-gray-500 text-sm">Total Alerts</p>
            <p className="text-3xl font-bold text-yellow-400">{stats?.total_alerts || 0}</p>
          </div>
          <div className="bg-[#111b28] p-6 rounded-xl border border-[#1a2332]">
            <p className="text-gray-500 text-sm">Critical Alerts</p>
            <p className="text-3xl font-bold text-red-500">{stats?.critical_alerts || 0}</p>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === sev
                  ? 'bg-[#00d4ff] text-[#0a0e17]'
                  : 'bg-[#1a2332] text-gray-400 hover:bg-[#243447]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Alerts Table */}
        <div className="bg-[#111b28] rounded-xl border border-[#1a2332] overflow-hidden">
          <div className="p-4 border-b border-[#1a2332]">
            <h2 className="text-xl font-semibold text-white">🚨 Alerts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a121e]">
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
                    <tr key={alert.id} className="border-t border-[#1a2332]">
                      <td className="px-4 py-3 text-gray-400">
                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[alert.severity]}`}>
                          {alert.severity}
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