import { useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';

function pad(n) { return String(n).padStart(2, '0'); }

function getNextBatch() {
  const now = new Date();
  const nextH = Math.ceil((now.getHours() + 1) / 6) * 6;
  const next  = new Date(now);
  next.setHours(nextH % 24, 0, 0, 0);
  if (nextH >= 24) next.setDate(next.getDate() + 1);
  return next;
}

export default function BatchTimer() {
  const [pending, setPending]       = useState(0);
  const [nextBatch, setNextBatch]   = useState(getNextBatch());
  const [remaining, setRemaining]   = useState({ h: 0, m: 0, s: 0 });
  const [flash, setFlash]           = useState(false);

  // Fetch live pending count
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/orders/batch-status');
        setPending(data.pendingCount);
        setNextBatch(new Date(data.nextBatchAt));
      } catch {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time batch events
  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;
    const onBatch = ({ orderCount }) => {
      setPending(0); // reset after batch fires
      setFlash(true);
      setTimeout(() => setFlash(false), 2000);
    };
    sock.on('batchReady', onBatch);
    return () => sock.off('batchReady', onBatch);
  }, []);

  // Countdown tick
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, nextBatch - Date.now());
      setRemaining({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [nextBatch]);

  const urgent = remaining.h === 0 && remaining.m < 10;

  return (
    <div style={{
      background: flash ? 'rgba(0,230,118,.08)' : urgent ? 'rgba(255,184,0,.06)' : 'var(--bg-surface)',
      border: `1px solid ${flash ? 'rgba(0,230,118,.3)' : urgent ? 'rgba(255,184,0,.25)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)', padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 20,
      transition: 'all .4s ease',
    }}>
      <div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: '.1em', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
          Next Dispatch Batch
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {[
            { val: pad(remaining.h), unit: 'HR'  },
            { val: pad(remaining.m), unit: 'MIN' },
            { val: pad(remaining.s), unit: 'SEC' },
          ].map(({ val, unit }, i) => (
            <div key={unit} style={{ display: 'flex', alignItems: 'center', gap: i < 2 ? 6 : 0 }}>
              <div className="num-display" style={{
                fontSize: 20, color: urgent ? 'var(--gold)' : 'var(--saffron)',
                borderColor: urgent ? 'rgba(255,184,0,.2)' : 'var(--border)',
                minWidth: 48,
              }}>
                {val}
              </div>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {unit}
              </span>
              {i < 2 && <span style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1, marginLeft: -2 }}>:</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)',
                      color: pending > 0 ? 'var(--saffron)' : 'var(--text-muted)' }}>
          {pending}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: '.08em', fontFamily: 'var(--font-mono)' }}>
          Pending Orders
        </div>
      </div>

      {flash && (
        <span className="badge badge-success animate-in">
          ✓ Batch Fired!
        </span>
      )}
      {urgent && !flash && (
        <span className="badge badge-warning">
          ⚡ Dispatching Soon
        </span>
      )}
    </div>
  );
}
