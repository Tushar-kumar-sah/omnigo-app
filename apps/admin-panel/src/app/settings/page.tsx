'use client';
import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';

export default function SettingsPage() {
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = () => {
    setSavedNotice('System configuration synchronized across cluster.');
    setTimeout(() => setSavedNotice(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Platform Infrastructure & Settings
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Global environment variables, webhook endpoints, dispatch grace timeouts, and security policies
          </p>
        </div>

        <button
          onClick={handleSave}
          style={{
            background: 'var(--accent-green)',
            color: '#000',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Save Configuration
        </button>
      </div>

      {savedNotice && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--accent-green-subtle)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '8px',
          color: 'var(--accent-green)',
          fontSize: '0.86rem',
          fontWeight: 600,
        }}>
          ✓ {savedNotice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <GlassCard style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '1rem' }}>
            Dispatch Engine Parameters
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Default Platform Commission Take (%)</label>
              <input type="number" defaultValue={10} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Auto-Assignment Proximity Radius (km)</label>
              <input type="number" defaultValue={15} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Driver Response Timeout (seconds)</label>
              <input type="number" defaultValue={45} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <input type="checkbox" defaultChecked style={{ width: 'auto' }} />
              <label style={{ color: '#E2E8F0', fontSize: '0.82rem' }}>Autonomous fallback to next closest unit</label>
            </div>
          </div>
        </GlassCard>

        <GlassCard style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '1rem' }}>
            Emergency & Security Policies
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>SOS Police 112 API Endpoint Gateway</label>
              <input type="text" defaultValue="https://api.emergency.gov.in/v1/distress" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Telemetry Ping Interval (seconds)</label>
              <input type="number" defaultValue={2} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Emergency Helpline Masked DID</label>
              <input type="text" defaultValue="+91 1800 266 4466" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <input type="checkbox" defaultChecked style={{ width: 'auto' }} />
              <label style={{ color: '#E2E8F0', fontSize: '0.82rem' }}>Enforce strict GPS geofencing on booking start</label>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
