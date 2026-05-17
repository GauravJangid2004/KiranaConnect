/**
 * StockBar — Visual stock level indicator with color-coded fill.
 * Shows stock quantity, unit, and a percentage bar at a glance.
 * Colors: green (>50%), amber (20-50%), red (<20%)
 */
export default function StockBar({ stock, maxStock = 2000, unit = 'kg', showLabel = true, height = 8 }) {
  const pct = Math.min(100, Math.max(0, (stock / maxStock) * 100));

  const getColor = () => {
    if (pct > 50) return { bar: '#20D68F', bg: 'rgba(32,214,143,0.12)', text: '#20D68F' };
    if (pct > 20) return { bar: '#FFB800', bg: 'rgba(255,184,0,0.12)', text: '#FFB800' };
    return { bar: '#FF1744', bg: 'rgba(255,23,68,0.12)', text: '#FF1744' };
  };

  const colors = getColor();

  const getLevel = () => {
    if (pct > 70) return 'High';
    if (pct > 40) return 'Medium';
    if (pct > 15) return 'Low';
    return 'Critical';
  };

  return (
    <div>
      {showLabel && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 5,
        }}>
          <span style={{
            fontSize: 10, color: '#6D7995', fontFamily: 'var(--font-mono, monospace)',
            textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600,
          }}>
            Stock · {getLevel()}
          </span>
          <span style={{
            fontSize: 11, color: colors.text,
            fontFamily: 'var(--font-mono, monospace)', fontWeight: 700,
          }}>
            {stock.toLocaleString('en-IN')} {unit}
            <span style={{ color: '#6D7995', fontWeight: 400, fontSize: 10, marginLeft: 4 }}>
              / {maxStock.toLocaleString('en-IN')}
            </span>
          </span>
        </div>
      )}
      <div style={{
        width: '100%',
        height,
        borderRadius: height,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: height,
          background: `linear-gradient(90deg, ${colors.bar}dd, ${colors.bar})`,
          transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
          boxShadow: `0 0 8px ${colors.bar}44`,
          position: 'relative',
        }}>
          {/* Animated shimmer */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: height,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'stockShimmer 2s ease-in-out infinite',
          }} />
        </div>
      </div>
    </div>
  );
}
