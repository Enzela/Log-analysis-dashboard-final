import { useState, useEffect } from 'react';

const LogHistory = ({ onNavigateBack, onLogout }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/logs/', { headers });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      const data = await res.json();
      console.log('Logs data:', data); // Debug
      setLogs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, filename) => {
    if (!confirm(`Delete "${filename}"? This will remove all related data.`)) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`/api/logs/${id}/`, { method: 'DELETE', headers });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      if (res.ok) {
        setLogs(logs.filter(log => log.id !== id));
      } else {
        setError('Delete failed');
      }
    } catch (err) {
      setError('Delete failed');
    }
  };

  const filteredLogs = logs.filter(log =>
    log.filename.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#f59e0b] text-xl">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateBack}
              className="px-4 py-2 bg-[#1a1a1a] text-gray-400 rounded-lg hover:bg-[#2a2a2a] transition text-sm border border-[#2a2a2a]"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">📁 Log History</h1>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm"
          >
            🚪 Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/30">
            ❌ {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#f59e0b] transition"
          />
        </div>

        {/* Logs Table */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0a0a0a]">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Filename</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Uploaded</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Entries</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Anomalies</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No logs found. Upload a log file to get started.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-t border-[#2a2a2a]">
                      <td className="px-4 py-3 text-gray-300">{log.filename}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {log.uploaded_at ? new Date(log.uploaded_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.status === 'processed'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {log.status || 'pending'}
                        </span>
                      </td>
                      {/* ✅ FIX: Use entries_count and anomalies_count */}
                      <td className="px-4 py-3 text-gray-400">{log.entries_count || 0}</td>
                      <td className="px-4 py-3 text-gray-400">{log.anomalies_count || 0}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(log.id, log.filename)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-xs"
                        >
                          🗑️ Delete
                        </button>
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

export default LogHistory;