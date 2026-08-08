import React, { useState } from 'react';

export default function PriceTrendChart({ currentItem }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const suggestedPrice = currentItem.suggestedPrice || 50;
  const originalPrice = currentItem.purchaseDetails?.originalPrice;
  const purchaseDate = currentItem.purchaseDetails?.purchaseDate;

  let ageInMonths = 12;
  let basePrice = originalPrice || (suggestedPrice * 1.6);
  if (purchaseDate) {
    const pDate = new Date(purchaseDate);
    const today = new Date();
    ageInMonths = Math.max(1, (today.getFullYear() - pDate.getFullYear()) * 12 + today.getMonth() - pDate.getMonth());
  }

  // Calculate decay constant k
  let k = 0.039; // default decay
  if (basePrice > suggestedPrice) {
    k = -Math.log(suggestedPrice / basePrice) / ageInMonths;
  }
  k = Math.max(0.005, Math.min(0.1, k)); // clamp to reasonable range

  const getPriceAtRelativeMonth = (r) => {
    if (purchaseDate && -r > ageInMonths) {
      return basePrice;
    }
    const val = suggestedPrice * Math.exp(-k * r);
    return Math.max(5, parseFloat(val.toFixed(2)));
  };

  const points = [
    { label: 'Vor 12 Mon.', rel: -12, price: getPriceAtRelativeMonth(-12) },
    { label: 'Vor 6 Mon.', rel: -6, price: getPriceAtRelativeMonth(-6) },
    { label: 'Heute', rel: 0, price: suggestedPrice },
    { label: 'In 6 Mon.', rel: 6, price: getPriceAtRelativeMonth(6) },
    { label: 'In 12 Mon.', rel: 12, price: getPriceAtRelativeMonth(12) }
  ];

  const width = 300;
  const height = 150;
  const padding = 20;

  const minPrice = Math.min(...points.map(p => p.price)) * 0.9;
  const maxPrice = Math.max(...points.map(p => p.price)) * 1.1;

  const getX = (index) => padding + (index * (width - 2 * padding)) / (points.length - 1);
  const getY = (price) => height - padding - ((price - minPrice) * (height - 2 * padding)) / (maxPrice - minPrice);

  let pathD = '';
  points.forEach((p, idx) => {
    const x = getX(idx);
    const y = getY(p.price);
    if (idx === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      const prevX = getX(idx - 1);
      const prevY = getY(points[idx - 1].price);
      const cpX1 = prevX + (x - prevX) / 2;
      const cpY1 = prevY;
      const cpX2 = prevX + (x - prevX) / 2;
      const cpY2 = y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
    }
  });

  const oneYearLossPercent = Math.round((1 - getPriceAtRelativeMonth(12) / suggestedPrice) * 100);
  
  let recommendation = 'Wertstabil - Keine Eile beim Verkauf';
  let badgeColor = 'var(--accent-emerald)';
  let badgeBg = 'var(--accent-emerald-bg)';
  if (oneYearLossPercent > 20) {
    recommendation = 'Schneller Wertverlust - Jetzt verkaufen';
    badgeColor = 'var(--accent-rose)';
    badgeBg = 'var(--accent-rose-bg)';
  } else if (oneYearLossPercent > 10) {
    recommendation = 'Moderater Wertverlust - Zeitnah verkaufen';
    badgeColor = 'var(--accent-amber)';
    badgeBg = 'var(--accent-amber-bg)';
  }

  return (
    <div className="glass-panel price-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', textAlign: 'left' }}>Preishistorie & Werttrend</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'left' }}>Geschätzte Abschreibung über die Zeit:</p>

      <div style={{ position: 'relative', marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
          <line x1={padding} y1={getY(minPrice)} x2={width-padding} y2={getY(minPrice)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1={padding} y1={getY((minPrice+maxPrice)/2)} x2={width-padding} y2={getY((minPrice+maxPrice)/2)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1={padding} y1={getY(maxPrice)} x2={width-padding} y2={getY(maxPrice)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

          <path
            d={`${pathD} L ${getX(points.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`}
            fill="url(#chart-glow)"
            opacity="0.1"
          />

          <path
            d={pathD}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow-filter)"
          />

          {points.map((p, idx) => {
            const x = getX(idx);
            const y = getY(p.price);
            const isHovered = hoveredPoint === idx;

            return (
              <g key={idx} onMouseEnter={() => setHoveredPoint(idx)} onMouseLeave={() => setHoveredPoint(null)}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={p.rel === 0 ? 'var(--accent-amber)' : 'var(--primary)'}
                  stroke="#fff"
                  strokeWidth={isHovered ? 2 : 1}
                  style={{ transition: 'r 0.2s, stroke-width 0.2s', cursor: 'pointer' }}
                />
              </g>
            );
          })}

          <defs>
            <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>

        {hoveredPoint !== null && (
          <div 
            className="chart-tooltip"
            style={{
              position: 'absolute',
              bottom: `${height - getY(points[hoveredPoint].price) + 12}px`,
              left: `${(getX(hoveredPoint) / width) * 100}%`,
              transform: 'translateX(-50%)',
              background: 'rgba(13, 15, 20, 0.95)',
              border: '1px solid var(--border-color)',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              pointerEvents: 'none',
              boxShadow: 'var(--shadow-md)',
              zIndex: 10,
              whiteSpace: 'nowrap',
              color: '#fff'
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{points[hoveredPoint].label}</div>
            <div style={{ fontWeight: 700, color: 'var(--accent-amber)', fontSize: '0.85rem', marginTop: '2px' }}>
              {points[hoveredPoint].price.toFixed(2)} €
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '0 8px' }}>
        {points.map((p, idx) => (
          <span key={idx} style={{ fontSize: '0.7rem', color: p.rel === 0 ? '#fff' : 'var(--text-muted)', fontWeight: p.rel === 0 ? 700 : 500 }}>
            {p.rel === 0 ? 'Heute' : p.rel > 0 ? `+${p.rel}M` : `${p.rel}M`}
          </span>
        ))}
      </div>

      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>Wertverlust (12 Monate):</span>
          <strong style={{ color: 'var(--accent-rose)' }}>-{oneYearLossPercent}%</strong>
        </div>
        <span 
          className="badge" 
          style={{ 
            position: 'static', 
            padding: '4px 10px', 
            fontSize: '0.75rem', 
            color: badgeColor, 
            backgroundColor: badgeBg, 
            borderColor: 'transparent',
            fontWeight: 600,
            marginTop: '4px'
          }}
        >
          {recommendation}
        </span>
      </div>
    </div>
  );
}
