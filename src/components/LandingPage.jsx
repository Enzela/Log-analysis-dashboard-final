import { useState } from "react";

const slides = [
  { tag: "> system.status = ACTIVE", component: "hero" },
  { tag: "// features", title: "Everything in one dashboard", desc: "From log ingestion to AI-powered threat detection — all automated.", component: "features" },
  { tag: "// live threat feed", title: "Detected threats dashboard", desc: "Every suspicious entry gets labeled, scored, and tracked automatically.", component: "threats" },
  { tag: "// how it works", title: "Simple 4-step process", desc: "From upload to alert — fully automated pipeline.", component: "flow" },
  { tag: "// tech stack", title: "Built with modern tools", desc: "Full-stack AI-powered web application using industry-standard technologies.", component: "tech" },
  { tag: "// target users", title: "Who is this for?", desc: "Built for security and infrastructure teams who need fast threat visibility.", component: "users" },
];

const threats = [
  { time: "2026-06-20 14:45", ip: "192.168.1.50", event: "brute_force", severity: "CRITICAL", score: "0.95" },
  { time: "2026-06-20 13:30", ip: "203.0.113.7", event: "file_access", severity: "HIGH", score: "0.90" },
  { time: "2026-06-20 12:05", ip: "10.0.0.5", event: "port_scan", severity: "MEDIUM", score: "0.70" },
  { time: "2026-06-20 10:15", ip: "192.168.1.10", event: "login_success", severity: "LOW", score: "0.10" },
];

const severityClass = {
  CRITICAL: "bg-red-200/60 text-red-800 border border-red-300",
  HIGH: "bg-orange-200/60 text-orange-800 border border-orange-300",
  MEDIUM: "bg-blue-200/60 text-blue-800 border border-blue-300",
  LOW: "bg-stone-200/60 text-stone-600 border border-stone-300",
};

const BG = "#D8C4B6";
const BORDER = "#c4a898";
const TEXT = "#3d2e26";
const MUTED = "#7a6258";

export default function LandingPage({ onNavigateToDashboard }) {
  const [cur, setCur] = useState(0);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const go = (dir) => setCur((p) => Math.max(0, Math.min(slides.length - 1, p + dir)));
  const goTo = (i) => setCur(i);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
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
      const res = await fetch("/api/logs/upload/", {
        method: "POST",
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
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: BG, color: TEXT, fontFamily: "sans-serif" }}>

      {/* Navbar with Dashboard Button */}
      <div className="flex justify-between items-center px-8 py-4" style={{ borderBottom: `0.5px solid ${BORDER}`, background: BG }}>
        <div className="font-mono text-base tracking-wider flex items-center gap-2" style={{ color: TEXT }}>
          ⬡ LogGuard<span style={{ color: MUTED }}>_AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateToDashboard}
            style={{
              background: "#1a1a1a",
              color: "#fff",
              padding: "6px 16px",
              fontSize: 12,
              border: "none",
              cursor: "pointer",
              fontFamily: "monospace",
              letterSpacing: "0.05em",
              borderRadius: "4px"
            }}
          >
            📊 Dashboard →
          </button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: i === cur ? TEXT : "transparent",
                  border: `1.5px solid ${i === cur ? TEXT : BORDER}`,
                  cursor: "pointer", transition: "all 0.2s"
                }}
              />
            ))}
          </div>
          <div className="font-mono text-sm" style={{ color: MUTED }}>
            {String(cur + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>
        </div>
      </div>

      {/* Slides */}
      <div className="flex-1 overflow-hidden relative">
        <div className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${cur * 100}%)` }}>
          {slides.map((slide, i) => (
            <div key={i} className="min-w-full h-full px-10 py-8 flex flex-col justify-center relative overflow-y-auto">
              <div className="relative z-10">
                <div className="font-mono text-sm tracking-widest mb-4" style={{ color: MUTED }}>
                  {slide.tag}
                  {slide.component === "hero" && (
                    <span className="inline-block ml-1 align-middle animate-pulse"
                      style={{ width: 10, height: 16, background: TEXT, display: "inline-block" }} />
                  )}
                </div>

                {/* HERO */}
                {slide.component === "hero" && (
                  <div>
                    <h1 className="text-5xl font-medium leading-tight mb-4" style={{ color: TEXT }}>
                      AI-powered <span style={{ color: "#5c3d2e" }}>threat detection</span><br />for your system logs
                    </h1>
                    <p className="text-lg max-w-xl mb-6 leading-relaxed" style={{ color: MUTED }}>
                      Upload logs. AI scans for anomalies, flags threats, and alerts you — before damage is done.
                    </p>

                    <div className="flex flex-wrap gap-3 mb-6">
                      <input
                        type="file"
                        id="fileInput"
                        onChange={handleFileChange}
                        accept=".json,.txt"
                        style={{ display: "none" }}
                      />
                      <label
                        htmlFor="fileInput"
                        style={{
                          background: "#1a1a1a",
                          color: "#fff",
                          padding: "10px 24px",
                          fontSize: 14,
                          fontWeight: 500,
                          border: "none",
                          cursor: "pointer",
                          letterSpacing: "0.05em"
                        }}
                      >
                        📁 Choose Log File
                      </label>
                      {file && (
                        <span style={{ color: "#4ade80", padding: "10px 0", fontSize: 14 }}>
                          📄 {file.name}
                        </span>
                      )}
                      <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        style={{
                          background: !file || loading ? "#555" : "#1a1a1a",
                          color: "#fff",
                          padding: "10px 24px",
                          fontSize: 14,
                          fontWeight: 500,
                          border: "none",
                          cursor: !file || loading ? "not-allowed" : "pointer",
                          letterSpacing: "0.05em"
                        }}
                      >
                        {loading ? "⏳ Scanning..." : "▶ start scanning"}
                      </button>
                    </div>

                    {error && (
                      <div style={{ color: "#ef4444", marginBottom: "1rem" }}>❌ {error}</div>
                    )}

                    {result && (
                      <div className="mb-6 p-4" style={{ background: "#1a1a1a", border: "1px solid #333" }}>
                        <div className="flex gap-6 mb-3">
                          <div>
                            <span style={{ color: "#64748b" }}>Total Entries</span>
                            <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 600 }}>{result.detected || 0}</div>
                          </div>
                          <div>
                            <span style={{ color: "#64748b" }}>Anomalies</span>
                            <div style={{ color: "#f87171", fontSize: "1.5rem", fontWeight: 600 }}>{result.anomalies || 0}</div>
                          </div>
                        </div>
                        {result.anomaly_list && result.anomaly_list.length > 0 && (
                          <div>
                            <div style={{ color: "#fbbf24", marginBottom: "0.5rem" }}>⚠️ Anomalies:</div>
                            {result.anomaly_list.slice(0, 3).map((item, idx) => (
                              <div key={idx} style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                                {item.timestamp || "N/A"} — {item.event || item.raw || "Unknown"}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="font-mono text-sm p-5 max-w-xl" style={{ background: "#1a1a1a", border: "1px solid #333" }}>
                      <div className="flex gap-1.5 mb-3">
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }} />
                      </div>
                      <p className="mb-1.5">
                        <span style={{ color: "#666" }}>$</span>{" "}
                        <span style={{ color: "#4ade80", fontWeight: 500 }}>logguard</span>{" "}
                        <span style={{ color: "#94a3b8" }}>--analyze server_log_01.txt</span>
                      </p>
                      <p className="mb-1.5" style={{ color: "#64748b" }}>→ scanning 1,247 entries...</p>
                      <p className="mb-1.5" style={{ color: "#fbbf24" }}>⚠ anomaly <span style={{ color: "#64748b" }}>192.168.1.25 — brute force</span></p>
                      <p className="mb-1.5" style={{ color: "#f87171" }}>✗ critical <span style={{ color: "#64748b" }}>203.0.113.7 — unauthorized access</span></p>
                      <p style={{ color: "#4ade80" }}>✓ alert sent <span style={{ color: "#64748b" }}>enzela@test.com</span></p>
                    </div>
                  </div>
                )}

                {/* FEATURES */}
                {slide.component === "features" && (
                  <div>
                    <h2 className="text-3xl font-medium mb-2" style={{ color: TEXT }}>{slide.title}</h2>
                    <p className="text-base mb-5" style={{ color: MUTED }}>{slide.desc}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: "⬆", title: "Log ingestion", desc: "Upload JSON or plain text logs from SSH, Apache, firewall sources.", accent: "#e74c3c" },
                        { icon: "⚙", title: "AI detection", desc: "Isolation Forest ML model scans and flags anomalies automatically.", accent: "#3498db" },
                        { icon: "🔔", title: "Real-time alerts", desc: "Instant email alert when critical threats are detected.", accent: "#f39c12" },
                        { icon: "⬇", title: "Export reports", desc: "Download full threat reports as PDF or CSV anytime.", accent: "#27ae60" },
                      ].map((f, idx) => (
                        <div key={idx} className="p-5" style={{ background: "#1a1a1a", border: "1px solid #333" }}>
                          <div className="text-2xl mb-3" style={{ color: f.accent }}>{f.icon}</div>
                          <h3 className="text-base font-medium mb-1" style={{ color: "#f1f5f9" }}>{f.title}</h3>
                          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* THREATS */}
                {slide.component === "threats" && (
                  <div>
                    <h2 className="text-3xl font-medium mb-2" style={{ color: TEXT }}>{slide.title}</h2>
                    <p className="text-base mb-5" style={{ color: MUTED }}>{slide.desc}</p>
                    <div style={{ background: "#1a1a1a", border: "1px solid #333", padding: "20px" }}>
                      <table className="w-full text-sm font-mono border-collapse">
                        <thead>
                          <tr>
                            {["timestamp", "source ip", "event", "severity", "score"].map(h => (
                              <th key={h} className="text-left pb-3 pr-6 font-medium tracking-wider"
                                style={{ color: "#4ade80", borderBottom: "0.5px solid #333" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {threats.map((t, idx) => (
                            <tr key={idx} style={{ borderBottom: "0.5px solid #1f1f1f" }}>
                              <td className="py-3 pr-6" style={{ color: "#64748b" }}>{t.time}</td>
                              <td className="py-3 pr-6" style={{ color: "#94a3b8" }}>{t.ip}</td>
                              <td className="py-3 pr-6" style={{ color: "#94a3b8" }}>{t.event}</td>
                              <td className="py-3 pr-6">
                                <span className={`px-2 py-0.5 text-xs tracking-wider ${severityClass[t.severity]}`}>{t.severity}</span>
                              </td>
                              <td className="py-3" style={{ color: "#64748b" }}>{t.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* FLOW */}
                {slide.component === "flow" && (
                  <div>
                    <h2 className="text-3xl font-medium mb-2" style={{ color: TEXT }}>{slide.title}</h2>
                    <p className="text-base mb-6" style={{ color: MUTED }}>{slide.desc}</p>
                    <div className="grid grid-cols-4 gap-0">
                      {[
                        { num: "01", title: "Upload", desc: "Drop log file into dashboard", color: "#3b82f6" },
                        { num: "02", title: "Parse", desc: "System reads and normalizes data", color: "#f59e0b" },
                        { num: "03", title: "Detect", desc: "AI model scans for anomalies", color: "#ef4444" },
                        { num: "04", title: "Alert", desc: "Email notification sent instantly", color: "#22c55e" },
                      ].map((s, idx) => (
                        <div key={idx} className="p-6 text-center relative"
                          style={{ background: "#1a1a1a", border: "1px solid #333" }}>
                          {idx < 3 && (
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 text-2xl"
                              style={{ color: "#444" }}>›</span>
                          )}
                          <div className="text-4xl font-medium font-mono mb-3" style={{ color: s.color }}>{s.num}</div>
                          <h4 className="text-base font-medium mb-1" style={{ color: "#f1f5f9" }}>{s.title}</h4>
                          <p className="text-sm" style={{ color: "#64748b" }}>{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TECH */}
                {slide.component === "tech" && (
                  <div>
                    <h2 className="text-3xl font-medium mb-2" style={{ color: TEXT }}>{slide.title}</h2>
                    <p className="text-base mb-5" style={{ color: MUTED }}>{slide.desc}</p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { name: "React + Tailwind CSS", color: "#61dafb" },
                        { name: "FastAPI (Python)", color: "#4ade80" },
                        { name: "PostgreSQL", color: "#60a5fa" },
                        { name: "scikit-learn", color: "#f97316" },
                        { name: "Isolation Forest", color: "#a78bfa" },
                        { name: "JWT Auth", color: "#f43f5e" },
                        { name: "Docker", color: "#38bdf8" },
                        { name: "GitHub Actions CI/CD", color: "#e2e8f0" },
                      ].map((t, idx) => (
                        <div key={idx} className="px-5 py-2.5 text-sm font-mono flex items-center gap-2"
                          style={{ background: "#1a1a1a", border: "1px solid #333", color: "#e2e8f0" }}>
                          <span style={{ color: t.color }}>▸</span> {t.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* USERS */}
                {slide.component === "users" && (
                  <div>
                    <h2 className="text-3xl font-medium mb-2" style={{ color: TEXT }}>{slide.title}</h2>
                    <p className="text-base mb-5" style={{ color: MUTED }}>{slide.desc}</p>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { icon: "🛡", title: "Security analysts", desc: "Monitor and respond to threats faster without manual log reading.", color: "#ef4444" },
                        { icon: "🖥", title: "DevOps engineers", desc: "Keep servers secure with automated monitoring and instant alerts.", color: "#3b82f6" },
                        { icon: "📊", title: "IT managers", desc: "Get executive-level threat summary reports at any time.", color: "#22c55e" },
                      ].map((u, idx) => (
                        <div key={idx} className="p-6 text-center"
                          style={{ background: "#1a1a1a", border: "1px solid #333", borderTop: `3px solid ${u.color}` }}>
                          <div className="text-4xl mb-4">{u.icon}</div>
                          <h4 className="text-base font-medium mb-2" style={{ color: "#f1f5f9" }}>{u.title}</h4>
                          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{u.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex justify-between items-center px-8 py-4"
        style={{ borderTop: `0.5px solid ${BORDER}`, background: BG }}>
        <button onClick={() => go(-1)} disabled={cur === 0}
          style={{ background: "#1a1a1a", color: "#fff", padding: "8px 20px", fontSize: 13, border: "none", cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.08em", opacity: cur === 0 ? 0.3 : 1 }}>
          [ ← prev ]
        </button>
        <div className="font-mono text-sm" style={{ color: MUTED }}>
          {String(cur + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>
        <button onClick={() => go(1)} disabled={cur === slides.length - 1}
          style={{ background: "#1a1a1a", color: "#fff", padding: "8px 20px", fontSize: 13, border: "none", cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.08em", opacity: cur === slides.length - 1 ? 0.3 : 1 }}>
          [ next → ]
        </button>
      </div>
    </div>
  );
}