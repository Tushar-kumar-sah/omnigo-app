'use client';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { drivers } from '@/lib/mock-data';

export default function FleetPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Fleet Map</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem', flex: 1 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <GlassCard style={{ flex: 1, overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Active Drivers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {drivers.map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.vehicle}</div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard style={{ padding: 0, position: 'relative', overflow: 'hidden', minHeight: '500px' }}>
          {/* Placeholder for map */}
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              <p>Live Map Integration Goes Here</p>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
