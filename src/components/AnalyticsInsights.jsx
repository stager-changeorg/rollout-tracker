import './AnalyticsInsights.css';

function Sparkline({ values, color = '#2563eb', width = 88, height = 32 }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return [x, y];
  });
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const fill = `0,${height} ${polyline} ${width},${height}`;
  const gradId = `sg${color.replace(/[^a-z0-9]/gi, '')}`;
  const [lx, ly] = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="sparkline-svg">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#${gradId})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}

function TrendBadge({ trend, label }) {
  const cfg = {
    up:      { icon: '↑', cls: 'trend-up' },
    down:    { icon: '↓', cls: 'trend-down' },
    neutral: { icon: '→', cls: 'trend-neutral' },
  }[trend] ?? { icon: '→', cls: 'trend-neutral' };

  return (
    <span className={`trend-badge ${cfg.cls}`}>
      {cfg.icon} {label}
    </span>
  );
}

function KpiCard({ kpi }) {
  const { label, value, sublabel, trend, trendLabel, sparkline, chartUrl } = kpi;
  const sparkColor = trend === 'up' ? '#059669' : trend === 'down' ? '#dc2626' : '#6b7280';

  return (
    <a href={chartUrl} target="_blank" rel="noopener noreferrer" className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-label">{label}</div>
        {sparkline && <Sparkline values={sparkline} color={sparkColor} />}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sublabel">{sublabel}</div>
      <TrendBadge trend={trend} label={trendLabel} />
    </a>
  );
}

export default function AnalyticsInsights({ data, marketName }) {
  if (!data) return null;
  const { lastUpdated, dashboardUrl, insights, kpis } = data;

  return (
    <div className="analytics-insights">
      <div className="ai-header">
        <div className="ai-header-left">
          <span className="ai-live-dot" />
          <span className="ai-title">Analytics · {marketName}</span>
          <span className="ai-updated">Updated {lastUpdated}</span>
        </div>
        <a href={dashboardUrl} target="_blank" rel="noopener noreferrer" className="ai-amplitude-link">
          Open in Amplitude ↗
        </a>
      </div>

      <div className="ai-insights">
        {insights.map((ins, i) => (
          <div key={i} className={`ai-insight ${ins.type}`}>
            <span className="ai-insight-dot" />
            {ins.text}
          </div>
        ))}
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi, i) => <KpiCard key={i} kpi={kpi} />)}
      </div>
    </div>
  );
}
