'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function ClientLayout({ children }: { children: any }) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {/* Executive Top Header Bar */}
        <header style={{
          height: '56px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(10, 14, 23, 0.8)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          {/* Left Region & Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(56, 189, 248, 0.1)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              letterSpacing: '0.04em',
            }}>
              PROD · AP-SOUTH-1
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              HQ Operations Command · Bangalore & Pune Fleet
            </span>
          </div>

          {/* Right Metrics & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {time && (
              <div suppressHydrationWarning style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                {time} IST
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--accent-green)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'var(--accent-green)' }} />
              <span style={{ fontWeight: 600 }}>Ledger Active</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '3px 10px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              border: '1px solid var(--glass-border)',
            }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '4px',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#000',
              }}>
                A
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>admin@omnigo.in</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '2rem 2.25rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </>
  );
}
