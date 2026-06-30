import { useState, useEffect } from 'react';

const AlertHistory = ({ onNavigateBack, onLogout }) => {
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
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'ALL' ? '/api/alerts' : `/api/alerts?severity=${filter}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-[#00d4ff] text-xl">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateBack}
              className="px-4 py-2 bg-[#1a2332] text-gray-400 rounded-lg hover:bg-[#243447] transition text-sm"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">🚨 Alert History</h1>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm"
          >
            🚪 Logout
          </button>
        </div>

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

        <div className="bg-[#111b28] rounded-xl border border-[#1a2332] overflow-hidden">
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

export default AlertHistory;