import { useState, useEffect } from 'react';

const LandingPage = ({ onNavigateToDashboard }) => {
  const [letters, setLetters] = useState([]);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const title = "LOG GUARD AI";

  const isLoggedIn = () => {
    return !!localStorage.getItem('token');
  };

  useEffect(() => {
    const chars = title.split('').map((char, index) => ({
      char: char === ' ' ? '\u00A0' : char,
      delay: index * 0.08,
      isSpace: char === ' '
    }));
    setLetters(chars);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

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

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow — yellow */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-radial from-[#f59e0b]/10 to-transparent opacity-30 animate-pulse" />

      <div className="relative z-10 text-center max-w-4xl w-full">
        {/* Sliding Letters — Yellow/Orange */}
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

        <p className="text-lg md:text-xl text-gray-400 mb-8 animate-fadeIn delay-500">
          AI-Powered Log Analysis &amp; Threat Detection
        </p>

        {/* If logged in — show Upload Section */}
        {isLoggedIn() ? (
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#f59e0b]/30 max-w-2xl mx-auto mb-6 animate-fadeIn delay-700">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                accept=".json,.txt"
                className="hidden"
              />
              <label
                htmlFor="fileInput"
                className="px-6 py-3 bg-black rounded-xl cursor-pointer border border-[#f59e0b] hover:bg-[#1a1a1a] transition text-gray-300 hover:text-white"
              >
                📁 Choose Log File
              </label>
              {file && <span className="text-[#f59e0b] text-sm truncate max-w-[150px]">📄 {file.name}</span>}
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`px-8 py-3 rounded-xl font-semibold transition ${
                  !file || loading
                    ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                    : 'bg-[#f59e0b] text-black hover:bg-[#f97316] hover:scale-105'
                }`}
              >
                {loading ? '⏳ Scanning...' : '🔍 Start Scanning'}
              </button>
            </div>
            {error && <p className="text-red-500 mt-3 text-sm">❌ {error}</p>}

            {/* Result Preview */}
            {result && (
              <div className="mt-4 p-4 bg-black rounded-xl border border-[#f59e0b]/20">
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
                    {result.anomaly_list.slice(0, 3).map((item, idx) => {
                      let entry = item;
                      if (typeof item === 'string') {
                        try { entry = JSON.parse(item); } catch (e) { entry = { raw: item }; }
                      }
                      const timestamp = entry.timestamp || entry.time || 'N/A';
                      const event = entry.event || entry.type || entry.raw || 'Unknown';
                      return (
                        <p key={idx} className="text-gray-400 text-sm">
                          {timestamp} — {event}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* If NOT logged in — show Get Started button (Air Canvas style) */
          <button
            onClick={onNavigateToDashboard}
            className="px-10 py-4 bg-black border-2 border-[#f59e0b] text-[#f59e0b] text-lg font-semibold rounded-xl hover:bg-[#f59e0b] hover:text-black transition-all duration-300 shadow-lg shadow-[#f59e0b]/25 animate-fadeIn delay-700"
          >
            Get Started
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-gray-600 text-xs">
        © 2026 LogGuard AI — Built with ❤️
      </div>
    </div>
  );
};

export default LandingPage;