import GlassCard from './GlassCard';

export default function StatsCard({
  title,
  value,
  trend,
  icon,
}: {
  title: string;
  value: string | number;
  trend?: string;
  icon?: string;
}) {
  const isPositive = trend && (trend.includes('+') || trend.includes('Optimal') || trend.includes('Active') || trend.includes('Success'));
  const isNegative = trend && (trend.includes('-') && !trend.includes('faster'));

  return (
    <GlassCard style={{
      padding: '1.25rem 1.4rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '0.65rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          color: 'var(--text-muted)',
          fontSize: '0.72rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {title}
        </span>
        {icon && <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{icon}</span>}
      </div>

      <div
        suppressHydrationWarning
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>

      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: isNegative ? 'var(--accent-red)' : 'var(--accent-green)',
            background: isNegative ? 'var(--accent-red-subtle)' : 'var(--accent-green-subtle)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: `1px solid ${isNegative ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`,
          }}>
            {trend}
          </span>
        </div>
      )}
    </GlassCard>
  );
}
