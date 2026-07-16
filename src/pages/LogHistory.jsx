import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const LogHistory = ({ onNavigateBack, onLogout }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ ip: '', event: '', startDate: '', endDate: '' });
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [search, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.ip) params.append('ip', filters.ip);
      if (filters.event) params.append('event', filters.event);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);

      const res = await fetch(`${API_URL}/api/logs/?${params.toString()}`, { headers });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError('Failed to fetch logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, filename) => {
    if (!confirm(`Delete "${filename}"? This will remove all related data.`)) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`${API_URL}/api/logs/delete_log/`, {
        method: 'DELETE',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: id })
      });
      if (res.status === 403) {
        setError('Permission denied. Only admins can delete.');
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

  const generateSummary = async (logId) => {
    setSummary(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`${API_URL}/api/logs/summary/`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId })
      });
      const data = await res.json();
      setSummary(data.summary || 'No summary available');
    } catch (err) {
      setSummary('Error generating summary');
    }
  };

  // ✅ नयाँ: Export PDF with token
  const downloadLogsPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reports/logs-pdf/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'log_history.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError('Failed to download PDF');
      console.error(err);
    }
  };

  const clearFilters = () => {
    setFilters({ ip: '', event: '', startDate: '', endDate: '' });
    setSearch('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#f59e0b] text-xl">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onNavigateBack} className="px-4 py-2 bg-[#1a1a1a] text-gray-400 rounded-lg hover:bg-[#2a2a2a] transition text-sm border border-[#2a2a2a]">
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">📁 Log History</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* ✅ Export PDF button — अब token पठाउँछ */}
            <button onClick={downloadLogsPDF} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-sm">
              📄 Export PDF
            </button>
            <button onClick={onLogout} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm">
              🚪 Logout
            </button>
          </div>
        </div>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/30">❌ {error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
          <input type="text" placeholder="🔍 Search filename..." value={search} onChange={(e) => setSearch(e.target.value)} className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#f59e0b]" />
          <input type="text" placeholder="📡 IP Address..." value={filters.ip} onChange={(e) => setFilters({...filters, ip: e.target.value})} className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#f59e0b]" />
          <input type="text" placeholder="⚡ Event..." value={filters.event} onChange={(e) => setFilters({...filters, event: e.target.value})} className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:border-[#f59e0b]" />
          <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white" />
          <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white" />
          <button onClick={clearFilters} className="p-2 bg-[#f59e0b]/20 text-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/30 transition">Clear Filters</button>
        </div>

        {summary && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#f59e0b]/30 max-w-2xl w-full m-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-white">🧠 Threat Summary</h2>
                <button onClick={() => setSummary(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="mt-4 text-gray-300 whitespace-pre-wrap">{summary}</div>
              <button onClick={() => setSummary(null)} className="mt-4 px-4 py-2 bg-[#f59e0b] text-black rounded-lg">Close</button>
            </div>
          </div>
        )}

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
                {logs.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No logs found. Upload a log file to get started.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-t border-[#2a2a2a]">
                      <td className="px-4 py-3 text-gray-300">{log.filename}</td>
                      <td className="px-4 py-3 text-gray-400">{log.uploaded_at ? new Date(log.uploaded_at).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${log.status === 'processed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{log.status || 'pending'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{log.entries_count || 0}</td>
                      <td className="px-4 py-3 text-gray-400">{log.anomalies_count || 0}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => generateSummary(log.id)} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-xs">📄 Summary</button>
                        <button onClick={() => handleDelete(log.id, log.filename)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-xs">🗑️ Delete</button>
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