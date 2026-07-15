import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const AlertHistory = ({ onNavigateBack, onLogout }) => {
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
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const url = filter === 'ALL' ? '/api/alerts/' : `/api/alerts/?severity=${filter}`;
      const res = await fetch(`${API_URL}${url}`, { headers });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      const data = await res.json();
      let alertsArray = [];
      if (Array.isArray(data)) {
        alertsArray = data;
      } else if (data.results) {
        alertsArray = data.results;
      } else if (data.alerts) {
        alertsArray = data.alerts;
      }
      // ensure severity uppercase
      alertsArray = alertsArray.map(a => ({ ...a, severity: a.severity ? a.severity.toUpperCase() : 'LOW' }));
      setAlerts(alertsArray);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#f59e0b] text-xl">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onNavigateBack} className="px-4 py-2 bg-[#1a1a1a] text-gray-400 rounded-lg hover:bg-[#2a2a2a] transition text-sm border border-[#2a2a2a]">
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">🚨 Alert History</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => window.open(`${API_URL}/api/reports/pdf/?severity=${filter}`, '_blank')} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm">📄 PDF</button>
            <button onClick={() => window.open(`${API_URL}/api/reports/csv/?severity=${filter}`, '_blank')} className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition text-sm">📊 CSV</button>
            <button onClick={onLogout} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm">🚪 Logout</button>
          </div>
        </div>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/30">❌ {error}</div>}

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

export default AlertHistory;