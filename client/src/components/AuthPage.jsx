import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const DISTRICTS = [
  "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara",
  "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur",
  "Ganganagar", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar",
  "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh",
  "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Tonk", "Udaipur",
];

const FEATURES = [
  { icon: "⚡", label: "Live Wholesale Prices", sub: "Tiered slab pricing — best rate auto-applied" },
  { icon: "🔄", label: "6-Hour Dispatch Batches", sub: "Orders aggregated, never missed" },
  { icon: "⚛️", label: "Redis-Cached Catalogue", sub: "24h TTL · sub-millisecond reads" },
  { icon: "🔒", label: "Atomic Stock Control", sub: "Race-condition proof · zero overselling" },
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode]       = useState("login");
  const [role, setRole]       = useState("shopOwner");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [mounted, setMounted] = useState(false);
  const [form, setForm]       = useState({
    phone: "", password: "", name: "", shopName: "", district: "Jaipur", gstNumber: "",
  });

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "login") await login(form.phone, form.password);
      else await register({ ...form, role });
    } catch (e) { setError(e.error || "Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #060608;
          font-family: 'Sora', sans-serif;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .auth-root::before {
          content: '';
          position: fixed;
          top: -20%; left: -10%;
          width: 60%; height: 60%;
          background: radial-gradient(ellipse, rgba(255,107,53,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-root::after {
          content: '';
          position: fixed;
          bottom: -20%; right: -10%;
          width: 50%; height: 50%;
          background: radial-gradient(ellipse, rgba(124,77,255,0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-bg-dots {
          position: fixed; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .auth-card {
          display: flex;
          width: 100%; max-width: 960px; min-height: 600px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          box-shadow: 0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,107,53,0.05);
          position: relative; z-index: 1;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .auth-card.mounted { opacity: 1; transform: translateY(0); }

        /* LEFT PANEL */
        .auth-left {
          width: 320px; flex-shrink: 0;
          background: linear-gradient(170deg, #0e0e1a 0%, #080810 100%);
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 40px 32px;
          display: flex; flex-direction: column;
          position: relative; overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 65%);
          pointer-events: none;
        }
        .brand-icon { font-size: 36px; margin-bottom: 10px; display: block; filter: drop-shadow(0 0 12px rgba(255,107,53,0.4)); }
        .brand-name { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; color: #F5F0FF; line-height: 1.1; }
        .brand-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.15em; color: #FF6B35; text-transform: uppercase; margin-top: 6px; }
        .divider { height: 1px; background: linear-gradient(90deg, rgba(255,107,53,0.3), transparent); margin: 28px 0; }
        .feature-list { display: flex; flex-direction: column; gap: 18px; flex: 1; }
        .feature-item { display: flex; gap: 12px; align-items: flex-start; opacity: 0; transform: translateX(-10px); transition: opacity 0.4s ease, transform 0.4s ease; }
        .feature-item.mounted { opacity: 1; transform: translateX(0); }
        .feature-icon { width: 34px; height: 34px; border-radius: 8px; background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.15); display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .feature-label { font-size: 12px; font-weight: 700; color: #E8E4FF; margin-bottom: 2px; }
        .feature-sub { font-size: 10.5px; color: #5858A0; line-height: 1.4; }
        .demo-hint { margin-top: 28px; padding: 10px 14px; background: rgba(255,107,53,0.06); border: 1px solid rgba(255,107,53,0.12); border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5858A0; line-height: 1.7; }
        .demo-hint span { color: #FF6B35; }

        /* RIGHT PANEL */
        .auth-right { flex: 1; background: #0a0a12; padding: 40px 40px; display: flex; flex-direction: column; justify-content: center; }
        .panel-title { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #F0F0FF; margin-bottom: 4px; }
        .panel-sub { font-size: 12px; color: #5858A0; margin-bottom: 28px; }

        .mode-toggle { display: flex; background: #0d0d18; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 4px; margin-bottom: 24px; }
        .mode-btn { flex: 1; padding: 9px 0; border: none; border-radius: 7px; font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .mode-btn.active { background: linear-gradient(135deg, #FF6B35, #e85a24); color: #fff; box-shadow: 0 4px 16px rgba(255,107,53,0.3); }
        .mode-btn.inactive { background: transparent; color: #5858A0; }

        .role-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #5858A0; margin-bottom: 8px; }
        .role-toggle { display: flex; gap: 8px; margin-bottom: 18px; }
        .role-btn { flex: 1; padding: 12px 0; border-radius: 10px; border: 1px solid; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .role-btn.active { background: rgba(255,107,53,0.1); border-color: rgba(255,107,53,0.35); color: #FF6B35; }
        .role-btn.inactive { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.07); color: #5858A0; }

        .form-group { display: flex; flex-direction: column; gap: 10px; }
        .auth-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #F0F0FF; font-family: 'Sora', sans-serif; font-size: 13px; padding: 11px 14px; outline: none; transition: all 0.2s; box-sizing: border-box; }
        .auth-input:focus { border-color: rgba(255,107,53,0.5); background: rgba(255,107,53,0.04); box-shadow: 0 0 0 3px rgba(255,107,53,0.08); }
        .auth-input::placeholder { color: #3a3a60; }
        .auth-input option { background: #0d0d18; color: #F0F0FF; }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .auth-error { background: rgba(255,23,68,0.07); border: 1px solid rgba(255,23,68,0.2); border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #FF1744; display: flex; align-items: center; gap: 6px; }

        .auth-submit { width: 100%; padding: 13px 0; border: none; border-radius: 10px; background: linear-gradient(135deg, #FF6B35 0%, #e8502a 100%); color: #fff; font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 20px rgba(255,107,53,0.35); margin-top: 4px; position: relative; overflow: hidden; }
        .auth-submit::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%); }
        .auth-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(255,107,53,0.45); }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display: inline-block; width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 6px; vertical-align: middle; }

        .section-sep { display: flex; align-items: center; gap: 10px; margin: 2px 0; }
        .section-sep-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .section-sep-text { font-size: 10px; color: #3a3a60; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }
      `}</style>

      <div className="auth-root">
        <div className="auth-bg-dots" />

        <div className={`auth-card ${mounted ? "mounted" : ""}`}>

          {/* ── LEFT BRAND PANEL ── */}
          <div className="auth-left">
            <div>
              <span className="brand-icon">🏪</span>
              <div className="brand-name">Kirana<br />Connect</div>
              <div className="brand-sub">Mandi Terminal · Rajasthan</div>
            </div>

            <div className="divider" />

            <div className="feature-list">
              {FEATURES.map(({ icon, label, sub }, i) => (
                <div key={label} className={`feature-item ${mounted ? "mounted" : ""}`}
                     style={{ transitionDelay: `${0.1 + i * 0.08}s` }}>
                  <div className="feature-icon">{icon}</div>
                  <div>
                    <div className="feature-label">{label}</div>
                    <div className="feature-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="demo-hint">
              <div>📱 Demo ShopOwner</div>
              <div><span>9876543211</span> / password123</div>
              <div style={{ marginTop: 6 }}>🏭 Demo Wholesaler</div>
              <div><span>9876543210</span> / password123</div>
            </div>
          </div>

          {/* ── RIGHT FORM PANEL ── */}
          <div className="auth-right">
            <div className="panel-title">
              {mode === "login" ? "Welcome back" : "Join the Mandi"}
            </div>
            <div className="panel-sub">
              {mode === "login"
                ? "Sign in to your KiranaConnect account"
                : "Create your account and start ordering wholesale"}
            </div>

            <div className="mode-toggle">
              {["login", "register"].map(m => (
                <button key={m} className={`mode-btn ${mode === m ? "active" : "inactive"}`}
                        onClick={() => { setMode(m); setError(""); }}>
                  {m === "login" ? "🔑  Sign In" : "📝  Register"}
                </button>
              ))}
            </div>

            {mode === "register" && (
              <>
                <div className="role-label">I am a —</div>
                <div className="role-toggle">
                  {[{ val: "shopOwner", emoji: "🏪", label: "Shop Owner" },
                    { val: "wholesaler", emoji: "🏭", label: "Wholesaler" }].map(({ val, emoji, label }) => (
                    <button key={val} className={`role-btn ${role === val ? "active" : "inactive"}`}
                            onClick={() => setRole(val)}>
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="form-group">
              {mode === "register" && (
                <>
                  <div className="two-col">
                    <input className="auth-input" placeholder="Full name"
                           value={form.name} onChange={e => set("name", e.target.value)} />
                    <input className="auth-input" placeholder="Shop / Business name"
                           value={form.shopName} onChange={e => set("shopName", e.target.value)} />
                  </div>

                  <select className="auth-input" value={form.district}
                          onChange={e => set("district", e.target.value)}>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>

                  {role === "wholesaler" && (
                    <input className="auth-input" placeholder="GST Number (optional)"
                           value={form.gstNumber} onChange={e => set("gstNumber", e.target.value)} />
                  )}

                  <div className="section-sep">
                    <div className="section-sep-line" />
                    <span className="section-sep-text">credentials</span>
                    <div className="section-sep-line" />
                  </div>
                </>
              )}

              <input className="auth-input" placeholder="📱  Phone number"
                     value={form.phone} onChange={e => set("phone", e.target.value)} />

              <input className="auth-input" type="password" placeholder="🔒  Password"
                     value={form.password} onChange={e => set("password", e.target.value)}
                     onKeyDown={e => e.key === "Enter" && submit()} />

              {error && (
                <div className="auth-error">
                  <span>⚠</span> {error}
                </div>
              )}

              <button className="auth-submit" onClick={submit} disabled={loading}>
                {loading
                  ? <><span className="spinner" />Please wait...</>
                  : mode === "login" ? "Enter Mandi Terminal →" : "Create Account →"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}