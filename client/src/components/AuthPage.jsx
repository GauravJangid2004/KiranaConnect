import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowRight,
  Building2,
  KeyRound,
  Lock,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Store,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';

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

const AUTH_FEATURES = [
  { icon: Zap, label: 'Live Wholesale Prices', sub: 'Tiered slab pricing with best-rate matching.' },
  { icon: RefreshCw, label: '6-Hour Dispatch Batches', sub: 'Orders grouped and routed on schedule.' },
  { icon: Truck, label: 'Fast Supply Coordination', sub: 'Buyer and wholesaler workflows stay synced.' },
  { icon: ShieldCheck, label: 'Atomic Stock Control', sub: 'Protected inventory updates for every order.' },
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
          background:
            linear-gradient(rgba(6,18,12,0.88), rgba(7,14,22,0.93)),
            url('/src/assets/warehouse-supply.jpg') center/cover fixed;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 26px 18px;
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
          display: grid; grid-template-columns: minmax(320px, 0.86fr) minmax(360px, 1.14fr);
          width: 100%; max-width: 1120px; min-height: 690px;
          border-radius: 28px; border: 1px solid rgba(255,255,255,0.16);
          overflow: hidden; position: relative; z-index: 1;
          box-shadow: 0 32px 110px rgba(0,0,0,0.44);
          opacity: 0; transform: translateY(24px) scale(0.99);
          transition: opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1);
          backdrop-filter: blur(22px);
        }
        .ap-card.on { opacity: 1; transform: translateY(0) scale(1); }

        /* LEFT */
        .ap-left {
          background:
            linear-gradient(180deg, rgba(14,31,19,.92), rgba(8,17,13,.96)),
            url('/src/assets/mobile-delivery.jpg') center/cover;
          border-right: 1px solid rgba(255,255,255,0.12);
          padding: 44px 36px; display: flex; flex-direction: column;
          position: relative; overflow: hidden;
        }
        .ap-glow1 { position: absolute; top: -80px; right: -80px; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(255,107,53,0.13) 0%, transparent 65%); pointer-events: none; }
        .ap-glow2 { position: absolute; bottom: -60px; left: -60px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(124,77,255,0.08) 0%, transparent 65%); pointer-events: none; }

        .ap-brand-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; position: relative; z-index: 1; }
        .ap-logo { width: 84px; height: 84px; border-radius: 24px; background: rgba(255,255,255,0.96); border: 1px solid rgba(255,255,255,0.36); display: flex; align-items: center; justify-content: center; box-shadow: 0 18px 45px rgba(0,0,0,0.22); overflow: hidden; flex-shrink: 0; }
        .ap-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ap-brand { font-size: 34px; font-weight: 800; letter-spacing: -0.02em; color: #F5F0FF; line-height: 1.1; }
        .ap-tag { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; background: rgba(255,107,53,0.12); border: 1px solid rgba(255,107,53,0.28); border-radius: 20px; padding: 7px 11px; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.12em; color: #FFB08D; text-transform: uppercase; position: relative; z-index: 1; }
        .ap-dot { width: 6px; height: 6px; border-radius: 50%; background: #FF6B35; animation: blink 1.4s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        .ap-sep { height: 1px; background: linear-gradient(90deg, rgba(255,107,53,0.25), transparent); margin: 32px 0; }

        .ap-feats { display: flex; flex-direction: column; gap: 18px; flex: 1; position: relative; z-index: 1; }
        .ap-feat { display: flex; gap: 14px; align-items: flex-start; opacity: 0; transform: translateX(-14px); transition: opacity 0.45s ease, transform 0.45s ease; }
        .ap-feat.on { opacity: 1; transform: translateX(0); }
        .ap-feat-ico { width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0; background: linear-gradient(180deg, rgba(255,107,53,0.18), rgba(255,107,53,0.06)); border: 1px solid rgba(255,107,53,0.24); display: flex; align-items: center; justify-content: center; color: #FF8A52; box-shadow: inset 0 1px 0 rgba(255,255,255,0.08); }
        .ap-feat-ico svg { width: 19px; height: 19px; }
        .ap-feat-lbl { font-size: 13px; font-weight: 700; color: #f0f4fb; margin-bottom: 4px; }
        .ap-feat-sub { font-size: 12px; color: #9aa8c3; line-height: 1.6; }

        /* RIGHT */
        .ap-right { background: linear-gradient(180deg, rgba(248,250,252,.97), rgba(240,253,244,.95)); padding: 48px 44px; display: flex; flex-direction: column; justify-content: center; overflow-y: auto; }
        .ap-panel { max-width: 520px; margin: 0 auto; width: 100%; padding: 32px; border-radius: 24px; border: 1px solid rgba(14,31,19,0.12); background: rgba(255,255,255,.9); box-shadow: 0 24px 56px rgba(14,31,19,.14); }
        .ap-heading { font-size: 31px; font-weight: 800; letter-spacing: 0; color: #0E1F13; margin-bottom: 8px; line-height: 1.08; }
        .ap-subhead { font-size: 14px; color: #64748b; margin-bottom: 30px; line-height: 1.7; }

        .ap-tabs { display: flex; background: #EEF2F7; border: 1px solid rgba(14,31,19,0.08); border-radius: 14px; padding: 4px; margin-bottom: 28px; gap: 4px; }
        .ap-tab { flex: 1; padding: 12px; border: none; border-radius: 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .ap-tab.on  { background: linear-gradient(135deg, #FF6B35, #d94f1c); color: #fff; box-shadow: 0 4px 18px rgba(255,107,53,0.32); }
        .ap-tab.off { background: transparent; color: #64748b; }

        .ap-role-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #64748b; margin-bottom: 10px; }
        .ap-roles { display: flex; gap: 8px; margin-bottom: 20px; }
        .ap-role { flex: 1; padding: 14px 0; border-radius: 12px; border: 1px solid; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .ap-role.on  { background: rgba(255,107,53,0.1); border-color: rgba(255,107,53,0.35); color: #FF6B35; }
        .ap-role.off { background: #fff; border-color: rgba(14,31,19,0.12); color: #64748b; }

        .ap-form { display: flex; flex-direction: column; gap: 12px; }
        .ap-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ap-input-wrap { position: relative; }
        .ap-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 17px; height: 17px; color: #94a3b8; pointer-events: none; }
        .ap-input { width: 100%; background: #fff; border: 1px solid rgba(14,31,19,0.14); border-radius: 12px; color: #0E1F13; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; padding: 13px 15px 13px 42px; outline: none; transition: all 0.2s; }
        select.ap-input { appearance: none; }
        .ap-input:focus { border-color: rgba(255,107,53,0.5); background: #fff; box-shadow: 0 0 0 3px rgba(255,107,53,0.1); }
        .ap-input::placeholder { color: #94a3b8; }
        .ap-input option { background: white; color: #0E1F13; }
        .ap-input:disabled { opacity: 0.35; cursor: not-allowed; }

        .ap-div { display: flex; align-items: center; gap: 10px; }
        .ap-div-line { flex: 1; height: 1px; background: rgba(14,31,19,0.1); }
        .ap-div-txt { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #64748b; text-transform: uppercase; }

        .ap-err { background: rgba(255,23,68,0.09); border: 1px solid rgba(255,23,68,0.22); border-radius: 12px; padding: 11px 15px; font-size: 12.5px; color: #ff7a92; }

        .ap-btn { width: 100%; padding: 15px 16px; border: none; border-radius: 14px; background: linear-gradient(135deg, #FF6B35, #d94f1c); color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14.5px; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 28px rgba(255,107,53,0.28); position: relative; overflow: hidden; margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .ap-btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%); }
        .ap-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(255,107,53,0.38); }
        .ap-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ap-spin { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 7px; vertical-align: middle; }

        @media (max-width: 860px) {
          .ap-card { grid-template-columns: 1fr; min-height: unset; max-width: 620px; }
          .ap-left { padding: 32px 28px; }
          .ap-feats { flex-direction: row; flex-wrap: wrap; }
          .ap-feat { width: calc(50% - 10px); }
          .ap-right { padding: 32px 28px; }
          .ap-panel { padding: 24px; }
        }
        @media (max-width: 540px) {
          .ap-root { padding: 10px; }
          .ap-card { border-radius: 20px; }
          .ap-left, .ap-right { padding: 24px 20px; }
          .ap-panel { padding: 20px; border-radius: 20px; }
          .ap-feat { width: 100%; }
          .ap-row { grid-template-columns: 1fr; }
          .ap-heading { font-size: 25px; }
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
            <div className="ap-brand-header">
              <div className="ap-logo">
                <img src={logoImg} alt="KiranaConnect" />
              </div>
              <div className="ap-brand">Kirana Connect</div>
            </div>
            <div className="ap-tag"><span className="ap-dot" /> B2B Wholesale / Pan India</div>
            <div className="ap-sep" />
            <div className="ap-feats">
              {AUTH_FEATURES.map(({ icon: Icon, label, sub }, i) => (
                <div key={label} className={`ap-feat ${mounted ? "on" : ""}`}
                     style={{ transitionDelay: `${0.12 + i * 0.09}s` }}>
                  <div className="ap-feat-ico"><Icon /></div>
                  <div>
                    <div className="ap-feat-lbl">{label}</div>
                    <div className="ap-feat-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* RIGHT */}
          <div className="ap-right">
            <div className="ap-panel">
              <div className="ap-heading">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </div>
              <div className="ap-subhead">
                {mode === 'login'
                  ? 'Sign in to your KiranaConnect account.'
                  : 'Start ordering from verified wholesalers across India.'}
              </div>

              <div className="ap-tabs">
                {[
                  ['login', KeyRound, 'Sign In'],
                  ['register', User, 'Register'],
                ].map(([m, Icon, lbl]) => (
                  <button
                    key={m}
                    type="button"
                    className={`ap-tab ${mode===m?'on':'off'}`}
                    title={lbl}
                    aria-label={lbl}
                    onClick={() => { setMode(m); setError(''); setAuthError(''); }}
                  >
                    <Icon size={17} /> {lbl}
                  </button>
                ))}
              </div>

              {mode === 'register' && (
                <>
                  <div className="ap-role-lbl">I am a</div>
                  <div className="ap-roles">
                    {[
                      ['shopOwner', Store, 'Shop Owner'],
                      ['wholesaler', Building2, 'Wholesaler'],
                    ].map(([v, Icon, lbl]) => (
                      <button
                        key={v}
                        type="button"
                        className={`ap-role ${role===v?'on':'off'}`}
                        title={lbl}
                        aria-label={lbl}
                        onClick={() => setRole(v)}
                      >
                        <Icon size={17} /> {lbl}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="ap-form">
                {mode === 'register' && (
                  <>
                    <div className="ap-row">
                      <div className="ap-input-wrap">
                        <User className="ap-input-icon" />
                        <input className="ap-input" placeholder="Full name"
                              value={form.name} onChange={e => set('name', e.target.value)} />
                      </div>
                      <div className="ap-input-wrap">
                        <Store className="ap-input-icon" />
                        <input className="ap-input" placeholder="Shop / Business name"
                              value={form.shopName} onChange={e => set('shopName', e.target.value)} />
                      </div>
                    </div>

                    <div className="ap-row">
                      <div className="ap-input-wrap">
                        <MapPin className="ap-input-icon" />
                        <select className="ap-input" value={selectedState}
                                onChange={e => setSelectedState(e.target.value)}>
                          <option value="">Select State / UT</option>
                          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="ap-input-wrap">
                        <MapPin className="ap-input-icon" />
                        <select className="ap-input" value={form.district}
                                onChange={e => set('district', e.target.value)}
                                disabled={!selectedState}>
                          <option value="">Select District</option>
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    {role === 'wholesaler' && (
                      <div className="ap-input-wrap">
                        <Building2 className="ap-input-icon" />
                        <input className="ap-input" placeholder="GST Number (optional - 15 chars)"
                              value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} />
                      </div>
                    )}

                    <div className="ap-div">
                      <div className="ap-div-line" />
                      <span className="ap-div-txt">credentials</span>
                      <div className="ap-div-line" />
                    </div>
                  </>
                )}

                <div className="ap-input-wrap">
                  <Phone className="ap-input-icon" />
                  <input className="ap-input" placeholder="Phone number (10 digits)"
                        value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div className="ap-input-wrap">
                  <Lock className="ap-input-icon" />
                  <input className="ap-input" type="password" placeholder="Password (min 8 chars)"
                        value={form.password} onChange={e => set('password', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submit()} />
                </div>

                {(authError || error) && <div className="ap-err">{error || authError}</div>}

                <button className="ap-btn" onClick={submit} disabled={loading}>
                  {loading
                    ? <><span className="ap-spin" />Please wait...</>
                    : <>{mode === 'login' ? 'Enter Platform' : 'Create Account'} <ArrowRight size={17} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
