import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const INDIA_DATA = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool', 'Nellore', 'Kakinada', 'Rajahmundry', 'Kadapa', 'Anantapur'],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tezpur", "Tinsukia", "Bongaigaon"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Ara", "Begusarai", "Katihar", "Munger"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Bhilai", "Korba", "Jagdalpur", "Rajnandgaon", "Ambikapur"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Navsari"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Hisar", "Rohtak", "Karnal", "Sonipat", "Yamunanagar", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi", "Kullu", "Baddi", "Palampur"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Phusro"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belagavi", "Kalaburagi", "Davanagere", "Shivamogga", "Tumakuru", "Bidar"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Palakkad", "Malappuram", "Kottayam"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Ratlam", "Satna", "Rewa"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Thane", "Kolhapur", "Amravati", "Nanded"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul", "Senapati"],
  "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Tuensang"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Baripada"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Gurdaspur", "Hoshiarpur", "Pathankot", "Firozpur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bharatpur", "Sikar", "Barmer", "Jaisalmer", "Chittorgarh", "Bhilwara", "Tonk", "Nagaur"],
  "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Rangpo"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Dindigul"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Siddipet"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut", "Ghaziabad", "Noida", "Bareilly", "Gorakhpur", "Aligarh", "Moradabad", "Saharanpur", "Mathura", "Firozabad"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Nainital", "Rishikesh", "Mussoorie", "Rudrapur"],
  "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Howrah", "Kharagpur", "Haldia", "Darjeeling"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "Dwarka", "Rohini"],
  "Chandigarh": ["Chandigarh"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Jammu & Kashmir": ["Jammu", "Srinagar", "Anantnag", "Baramulla", "Udhampur", "Kathua", "Sopore", "Punch"],
  "Ladakh": ["Leh", "Kargil"],
  "Andaman & Nicobar": ["Port Blair", "Diglipur", "Car Nicobar"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy"],
  "Dadra & Nagar Haveli": ["Silvassa", "Amli", "Khanvel"],
  'Daman & Diu': ['Daman', 'Diu'],
};

const STATES = Object.keys(INDIA_DATA).sort();

const FEATURES = [
  { icon: 'PR', label: 'Live Wholesale Prices', sub: 'Tiered slab - best rate auto-applied' },
  { icon: 'BT', label: '6-Hour Dispatch Batches', sub: 'Orders aggregated, never missed' },
  { icon: 'RC', label: 'Redis-Cached Catalogue', sub: '24h TTL - sub-ms reads' },
  { icon: 'SC', label: 'Atomic Stock Control', sub: 'Zero overselling, guaranteed' },
];

export default function AuthPage() {
  const { login, register, authError, setAuthError } = useAuth();
  const [mode, setMode]           = useState('login');
  const [role, setRole]           = useState('shopOwner');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [mounted, setMounted]     = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [districts, setDistricts]         = useState([]);
  const [form, setForm] = useState({
    phone: '', password: '', name: '', shopName: '',
    state: '', district: '', gstNumber: '',
  });

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    if (selectedState) {
      const d = INDIA_DATA[selectedState] || [];
      setDistricts(d);
      setForm(f => ({ ...f, state: selectedState, district: d[0] || '' }));
    } else {
      setDistricts([]);
      setForm(f => ({ ...f, state: '', district: '' }));
    }
  }, [selectedState]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError('');
    setAuthError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.phone, form.password);
      else await register({ ...form, role });
    } catch (e) { setError(e.error || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ap-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #05050d;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .ap-orb {
          position: fixed; border-radius: 50%;
          filter: blur(80px); pointer-events: none;
          animation: orbFloat 8s ease-in-out infinite alternate;
        }
        .ap-orb-1 { width: 500px; height: 500px; top: -15%; left: -10%; background: radial-gradient(circle, rgba(255,107,53,0.12), transparent 65%); }
        .ap-orb-2 { width: 400px; height: 400px; bottom: -15%; right: -10%; background: radial-gradient(circle, rgba(124,77,255,0.1), transparent 65%); animation-delay: 3s; }
        .ap-orb-3 { width: 300px; height: 300px; top: 40%; left: 40%; background: radial-gradient(circle, rgba(0,229,255,0.06), transparent 65%); animation-delay: 5s; }
        @keyframes orbFloat { from{transform:translate(0,0) scale(1)} to{transform:translate(20px,30px) scale(1.08)} }
        .ap-grid {
          position: fixed; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 30px 30px; pointer-events: none;
        }

        .ap-card {
          display: flex; width: 100%; max-width: 1020px; min-height: 620px;
          border-radius: 28px; border: 1px solid rgba(255,255,255,0.07);
          overflow: hidden; position: relative; z-index: 1;
          box-shadow: 0 0 0 1px rgba(255,107,53,0.04), 0 50px 130px rgba(0,0,0,0.85);
          opacity: 0; transform: translateY(24px) scale(0.99);
          transition: opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1);
        }
        .ap-card.on { opacity: 1; transform: translateY(0) scale(1); }

        /* LEFT */
        .ap-left {
          width: 340px; flex-shrink: 0;
          background: linear-gradient(160deg, #0f0f1e 0%, #080812 100%);
          border-right: 1px solid rgba(255,255,255,0.05);
          padding: 44px 36px; display: flex; flex-direction: column;
          position: relative; overflow: hidden;
        }
        .ap-glow1 { position: absolute; top: -80px; right: -80px; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(255,107,53,0.13) 0%, transparent 65%); pointer-events: none; }
        .ap-glow2 { position: absolute; bottom: -60px; left: -60px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(124,77,255,0.08) 0%, transparent 65%); pointer-events: none; }

        .ap-logo { width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg, rgba(255,107,53,0.25), rgba(255,107,53,0.08)); border: 1px solid rgba(255,107,53,0.3); display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 18px; box-shadow: 0 8px 24px rgba(255,107,53,0.15); position: relative; z-index: 1; }
        .ap-brand { font-size: 26px; font-weight: 800; letter-spacing: -0.04em; color: #F5F0FF; line-height: 1.1; position: relative; z-index: 1; }
        .ap-tag { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.2); border-radius: 20px; padding: 4px 10px; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.12em; color: #FF6B35; text-transform: uppercase; position: relative; z-index: 1; }
        .ap-dot { width: 6px; height: 6px; border-radius: 50%; background: #FF6B35; animation: blink 1.4s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        .ap-sep { height: 1px; background: linear-gradient(90deg, rgba(255,107,53,0.25), transparent); margin: 30px 0; }

        .ap-feats { display: flex; flex-direction: column; gap: 20px; flex: 1; position: relative; z-index: 1; }
        .ap-feat { display: flex; gap: 14px; align-items: flex-start; opacity: 0; transform: translateX(-14px); transition: opacity 0.45s ease, transform 0.45s ease; }
        .ap-feat.on { opacity: 1; transform: translateX(0); }
        .ap-feat-ico { width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0; background: rgba(255,107,53,0.09); border: 1px solid rgba(255,107,53,0.16); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .ap-feat-lbl { font-size: 12.5px; font-weight: 700; color: #E8E4FF; margin-bottom: 3px; }
        .ap-feat-sub { font-size: 11px; color: #4a4a80; line-height: 1.5; }

        .ap-demo { margin-top: 30px; padding: 14px 16px; background: rgba(255,107,53,0.05); border: 1px solid rgba(255,107,53,0.1); border-radius: 12px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #4a4a80; line-height: 1.9; position: relative; z-index: 1; }
        .ap-demo b { color: #FF6B35; font-weight: 500; }

        /* RIGHT */
        .ap-right { flex: 1; background: #08080f; padding: 44px; display: flex; flex-direction: column; justify-content: center; overflow-y: auto; }
        .ap-heading { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; color: #F0F0FF; margin-bottom: 4px; }
        .ap-subhead { font-size: 13px; color: #4a4a80; margin-bottom: 30px; }

        .ap-tabs { display: flex; background: #0c0c18; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 4px; margin-bottom: 26px; gap: 4px; }
        .ap-tab { flex: 1; padding: 10px; border: none; border-radius: 9px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .ap-tab.on  { background: linear-gradient(135deg, #FF6B35, #d94f1c); color: #fff; box-shadow: 0 4px 18px rgba(255,107,53,0.32); }
        .ap-tab.off { background: transparent; color: #4a4a80; }

        .ap-role-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #4a4a80; margin-bottom: 9px; }
        .ap-roles { display: flex; gap: 8px; margin-bottom: 20px; }
        .ap-role { flex: 1; padding: 13px 0; border-radius: 12px; border: 1px solid; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 7px; }
        .ap-role.on  { background: rgba(255,107,53,0.1); border-color: rgba(255,107,53,0.35); color: #FF6B35; }
        .ap-role.off { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.07); color: #4a4a80; }

        .ap-form { display: flex; flex-direction: column; gap: 11px; }
        .ap-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
        .ap-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 11px; color: #F0F0FF; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; padding: 12px 15px; outline: none; transition: all 0.2s; }
        .ap-input:focus { border-color: rgba(255,107,53,0.5); background: rgba(255,107,53,0.04); box-shadow: 0 0 0 3px rgba(255,107,53,0.08); }
        .ap-input::placeholder { color: #2e2e50; }
        .ap-input option { background: #0c0c18; color: #F0F0FF; }
        .ap-input:disabled { opacity: 0.35; cursor: not-allowed; }

        .ap-div { display: flex; align-items: center; gap: 10px; }
        .ap-div-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
        .ap-div-txt { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #2e2e50; text-transform: uppercase; }

        .ap-err { background: rgba(255,23,68,0.07); border: 1px solid rgba(255,23,68,0.2); border-radius: 10px; padding: 11px 15px; font-size: 12.5px; color: #FF1744; }

        .ap-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #FF6B35, #d94f1c); color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14.5px; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 24px rgba(255,107,53,0.35); position: relative; overflow: hidden; margin-top: 4px; }
        .ap-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%); }
        .ap-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,107,53,0.45); }
        .ap-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ap-spin { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 7px; vertical-align: middle; }

        @media (max-width: 860px) {
          .ap-card { flex-direction: column; min-height: unset; max-width: 520px; }
          .ap-left { width: 100%; padding: 32px 28px; }
          .ap-feats { flex-direction: row; flex-wrap: wrap; }
          .ap-feat { width: calc(50% - 10px); }
          .ap-right { padding: 32px 28px; }
        }
        @media (max-width: 540px) {
          .ap-root { padding: 10px; }
          .ap-card { border-radius: 20px; }
          .ap-left, .ap-right { padding: 24px 20px; }
          .ap-feat { width: 100%; }
          .ap-row { grid-template-columns: 1fr; }
          .ap-heading { font-size: 22px; }
        }
      `}</style>

      <div className="ap-root">
        <div className="ap-orb ap-orb-1" />
        <div className="ap-orb ap-orb-2" />
        <div className="ap-orb ap-orb-3" />
        <div className="ap-grid" />

        <div className={`ap-card ${mounted ? "on" : ""}`}>

          {/* LEFT */}
          <div className="ap-left">
            <div className="ap-glow1" /><div className="ap-glow2" />
            <div className="ap-logo">KC</div>
            <div className="ap-brand">Kirana<br />Connect</div>
            <div className="ap-tag"><span className="ap-dot" /> B2B Wholesale - Pan India</div>
            <div className="ap-sep" />
            <div className="ap-feats">
              {FEATURES.map(({ icon, label, sub }, i) => (
                <div key={label} className={`ap-feat ${mounted ? "on" : ""}`}
                     style={{ transitionDelay: `${0.12 + i * 0.09}s` }}>
                  <div className="ap-feat-ico">{icon}</div>
                  <div>
                    <div className="ap-feat-lbl">{label}</div>
                    <div className="ap-feat-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="ap-demo">
              <div>ShopOwner Demo</div>
              <div><b>9876543211</b> / password123</div>
              <div style={{ marginTop: 6 }}>Wholesaler Demo</div>
              <div><b>9876543210</b> / password123</div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="ap-right">
            <div className="ap-heading">
              {mode === 'login' ? 'Welcome back' : 'Join the Mandi'}
            </div>
            <div className="ap-subhead">
              {mode === 'login'
                ? 'Sign in to your KiranaConnect account'
                : 'Create your account - available across all of India'}
            </div>

            <div className="ap-tabs">
              {[['login', 'IN', 'Sign In'], ['register', 'UP', 'Register']].map(([m, ico, lbl]) => (
                <button key={m} className={`ap-tab ${mode===m?'on':'off'}`}
                        onClick={() => { setMode(m); setError(''); setAuthError(''); }}>
                  {ico} {lbl}
                </button>
              ))}
            </div>

            {mode === 'register' && (
              <>
                <div className="ap-role-lbl">I am a</div>
                <div className="ap-roles">
                  {[['shopOwner', 'SO', 'Shop Owner'], ['wholesaler', 'WH', 'Wholesaler']].map(([v, ico, lbl]) => (
                    <button key={v} className={`ap-role ${role===v?'on':'off'}`} onClick={() => setRole(v)}>
                      {ico} {lbl}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="ap-form">
              {mode === 'register' && (
                <>
                  <div className="ap-row">
                    <input className="ap-input" placeholder="Full name"
                           value={form.name} onChange={e => set('name', e.target.value)} />
                    <input className="ap-input" placeholder="Shop / Business name"
                           value={form.shopName} onChange={e => set('shopName', e.target.value)} />
                  </div>

                  <div className="ap-row">
                    <select className="ap-input" value={selectedState}
                            onChange={e => setSelectedState(e.target.value)}>
                      <option value="">Select State / UT</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="ap-input" value={form.district}
                            onChange={e => set('district', e.target.value)}
                            disabled={!selectedState}>
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {role === 'wholesaler' && (
                    <input className="ap-input" placeholder="GST Number (optional - 15 chars)"
                           value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} />
                  )}

                  <div className="ap-div">
                    <div className="ap-div-line" />
                    <span className="ap-div-txt">credentials</span>
                    <div className="ap-div-line" />
                  </div>
                </>
              )}

              <input className="ap-input" placeholder="Phone number (10 digits)"
                     value={form.phone} onChange={e => set('phone', e.target.value)} />
              <input className="ap-input" type="password" placeholder="Password (min 8 chars)"
                     value={form.password} onChange={e => set('password', e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && submit()} />

              {(authError || error) && <div className="ap-err">WARN {error || authError}</div>}

              <button className="ap-btn" onClick={submit} disabled={loading}>
                {loading
                  ? <><span className="ap-spin" />Please wait...</>
                  : mode === 'login' ? 'Enter Mandi Terminal ->' : 'Create Account ->'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
