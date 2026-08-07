'use client';
import GlassCard from '@/components/GlassCard';

export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Platform Settings</h2>
        <button style={{ background: 'var(--accent-cyan)', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--glow-cyan)' }}>Save Changes</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <GlassCard>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Pricing & Commission</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)' }}>Platform Commission Rate (%)</label>
              <input type="number" defaultValue={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)' }}>Surge Pricing Multiplier</label>
              <input type="number" step="0.1" defaultValue={1.5} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <input type="checkbox" defaultChecked style={{ width: 'auto' }} />
              <label style={{ color: 'var(--text-secondary)' }}>Enable Dynamic Surge Pricing</label>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>General Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)' }}>Support Contact Email</label>
              <input type="email" defaultValue="support@omnigo.com" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)' }}>Base Cancellation Fee (₹)</label>
              <input type="number" defaultValue={200} />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
