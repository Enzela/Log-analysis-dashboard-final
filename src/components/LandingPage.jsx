import { useState, useEffect } from 'react';

const LandingPage = ({ onNavigateToDashboard }) => {
  const [letters, setLetters] = useState([]);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const title = "LOG GUARD AI";

  useEffect(() => {
    const chars = title.split('').map((char, index) => ({
      char: char === ' ' ? '\u00A0' : char,
      delay: index * 0.08,
      isSpace: char === ' '
    }));
    setLetters(chars);
  }, []);

  // ✅ File select handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  // ✅ Upload handler
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a log file first");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch("/api/logs/upload/", {
        method: "POST",
        headers: headers,
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed: " + res.statusText);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = () => !!localStorage.getItem('token');

  const handleCardClick = () => {
    if (isLoggedIn()) {
      onNavigateToDashboard();
    } else {
      onNavigateToDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-radial from-[#f59e0b]/10 to-transparent opacity-30 animate-pulse" />

      <div className="relative z-10 text-center max-w-4xl w-full">
        {/* Sliding Letters */}
        <div className="flex flex-wrap justify-center gap-1 mb-6">
          {letters.map((item, idx) => (
            <span
              key={idx}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-[#f97316] animate-slideDown"
              style={{
                animationDelay: `${item.delay}s`,
                opacity: 0,
                animationFillMode: 'forwards',
                display: item.isSpace ? 'inline-block w-4' : 'inline-block'
              }}
            >
              {item.char}
            </span>
          ))}
        </div>

        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-fadeIn delay-500">
          AI-Powered Log Analysis &amp; Threat Detection Dashboard
        </p>

        {/* ✅ UPLOAD SECTION — मुख्य fix यहाँ */}
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a] max-w-2xl mx-auto mb-6 animate-fadeIn delay-700">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* Hidden file input */}
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              accept=".json,.txt"
              className="hidden"
            />
            {/* Label triggers file input */}
            <label
              htmlFor="fileInput"
              className="px-6 py-3 bg-[#2a2a2a] rounded-xl cursor-pointer border border-[#3a3a3a] hover:border-[#f59e0b] transition text-gray-300"
            >
              📁 Choose Log File
            </label>
            {file && <span className="text-[#f59e0b] text-sm truncate max-w-[150px]">📄 {file.name}</span>}
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`px-8 py-3 rounded-xl font-semibold transition ${
                !file || loading
                  ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                  : 'bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white hover:scale-105'
              }`}
            >
              {loading ? '⏳ Scanning...' : '🔍 Start Scanning'}
            </button>
          </div>
          {error && <p className="text-red-500 mt-3 text-sm">❌ {error}</p>}
        </div>

        {/* Result Preview */}
        {result && (
          <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#2a2a2a] max-w-2xl mx-auto mb-6 animate-fadeIn">
            <div className="flex gap-8 justify-center">
              <div>
                <p className="text-gray-500 text-sm">Total Entries</p>
                <p className="text-3xl font-bold text-white">{result.detected || 0}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Anomalies</p>
                <p className="text-3xl font-bold text-red-500">{result.anomalies || 0}</p>
              </div>
            </div>
            {result.anomaly_list?.length > 0 && (
              <div className="mt-3 text-left">
                <p className="text-[#f59e0b] font-semibold">⚠️ Anomalies:</p>
                {result.anomaly_list.slice(0, 3).map((item, idx) => (
                  <p key={idx} className="text-gray-400 text-sm">
                    {item.timestamp || 'N/A'} — {item.event || item.raw || 'Unknown'}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Get Started Button */}
        <button
          onClick={onNavigateToDashboard}
          className="px-8 py-4 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white text-lg font-semibold rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#f59e0b]/25 animate-fadeIn delay-700"
        >
          🚀 Get Started
        </button>

        {/* Feature Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-400 text-sm animate-fadeIn delay-1000">
          {[
            { icon: '📤', title: 'Upload Logs', desc: 'Upload JSON or TXT logs' },
            { icon: '🤖', title: 'AI Detection', desc: 'ML-powered threat scanning' },
            { icon: '🔔', title: 'Real Alerts', desc: 'Instant critical notifications' }
          ].map((card, idx) => (
            <button
              key={idx}
              onClick={handleCardClick}
              className="group bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a] hover:border-[#f59e0b] transition-all duration-300 hover:shadow-lg hover:shadow-[#f59e0b]/20 hover:-translate-y-1 cursor-pointer text-left"
            >
              <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </span>
              <h3 className="text-white font-semibold text-base group-hover:text-[#f59e0b] transition-colors">
                {card.title}
              </h3>
              <p className="text-gray-500 text-sm mt-1">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-gray-600 text-xs">
        © 2026 LogGuard AI — Built with ❤️
      </div>
    </div>
  );
};

export default LandingPage;