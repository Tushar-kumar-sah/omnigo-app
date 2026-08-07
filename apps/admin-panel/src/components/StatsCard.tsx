import GlassCard from './GlassCard';

export default function StatsCard({ title, value, trend, icon }: { title: string, value: string | number, trend?: string, icon?: string }) {
  return (
    <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{title}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      {trend && <div style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>{trend}</div>}
    </GlassCard>
  );
}
