'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';

// Dynamically load LiveFleetMap with SSR disabled
const LiveFleetMap = dynamic(() => import('@/components/LiveFleetMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '480px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#070B14',
      borderRadius: '14px',
      color: 'var(--text-muted)',
      border: '1px solid var(--glass-border)',
    }}>
      Loading live Google Fleet Telemetry Map...
    </div>
  ),
});

export default function FleetMapPage() {
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'en_route' | 'arrived' | 'towing' | 'sos' | 'offline'>('all');
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/drivers');
        if (!res.ok) throw new Error('API error');
        const { drivers: live } = await res.json();
        if (live && live.length > 0) {
          setDrivers(live);
          setSelectedDriver((prev: any) => prev || live[0]);
        }
      } catch (e) {
        console.error('[Fleet]', e);
      }
    }
    load();
    // Refresh list every 20 seconds
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  const filteredDrivers = drivers.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'en_route': return '#38BDF8';
      case 'arrived': return '#F59E0B';
      case 'towing': return '#A855F7';
      case 'sos': return '#F43F5E';
      case 'offline': return '#64748B';
      default: return '#38BDF8';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 'calc(100vh - 7rem)' }}>
      {/* Top Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Fleet Telemetry Map
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Real-time GPS positioning, speed telemetry, and route active status powered by Google Maps Platform
          </p>
        </div>

        {/* State Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          {[
            { id: 'all', label: `All Units (${drivers.length})`, color: 'var(--text-secondary)' },
            { id: 'available', label: `Available (${drivers.filter((d) => d.status === 'available').length})`, color: '#10B981' },
            { id: 'en_route', label: `En-Route (${drivers.filter((d) => d.status === 'en_route').length})`, color: '#38BDF8' },
            { id: 'towing', label: `Towing (${drivers.filter((d) => d.status === 'towing').length})`, color: '#A855F7' },
            { id: 'sos', label: `Emergency (${drivers.filter((d) => d.status === 'sos').length})`, color: '#F43F5E' },
            { id: 'offline', label: `Offline (${drivers.filter((d) => d.status === 'offline').length})`, color: '#64748B' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: filter === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: filter === tab.id ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {tab.id !== 'all' && (
                <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: tab.color }} />
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Driver List + Live Google Map + Inspector Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr 340px', gap: '1.25rem', flex: 1, minHeight: 0 }}>
        
        {/* Left Driver List */}
        <GlassCard style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Active Fleet Units ({filteredDrivers.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredDrivers.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No units match the selected filter.
              </div>
            ) : (
              filteredDrivers.map((d) => {
                const isSelected = selectedDriver?.id === d.id;
                const color = getStatusColor(d.status);
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDriver(d)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#F8FAFC' }}>{d.name}</span>
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${color}15`,
                        color: color,
                        fontWeight: 700,
                        border: `1px solid ${color}33`,
                        textTransform: 'uppercase',
                      }}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.vehicleType}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                      {d.vehiclePlate} · Rating {d.rating || '5.0'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        {/* Center: Interactive Google Map */}
        <GlassCard style={{ padding: 0, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
          <LiveFleetMap
            drivers={filteredDrivers}
            selectedDriver={selectedDriver}
            onSelectDriver={(driver) => setSelectedDriver(driver)}
          />

          {/* Map Bottom Telemetry Legend */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            background: 'rgba(13,19,34,0.92)',
            border: '1px solid var(--glass-border)',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'none',
          }}>
            <div>
              Target:{' '}
              <strong>
                {selectedDriver
                  ? `${(selectedDriver.location?.lat || selectedDriver.latitude || 28.6139).toFixed(4)}° N, ${(selectedDriver.location?.lng || selectedDriver.longitude || 77.209).toFixed(4)}° E`
                  : 'No unit selected'}
              </strong>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <span>Telemetry: <strong style={{ color: 'var(--accent-green)' }}>Real-time PostGIS Sync</strong></span>
              <span>Sync Rate: <strong>Stream</strong></span>
            </div>
          </div>
        </GlassCard>

        {/* Right Driver Telemetry Inspector */}
        {selectedDriver ? (
          <GlassCard style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Unit Telemetry Dossier
              </span>
              <StatusBadge status={selectedDriver.status === 'sos' ? 'High' : selectedDriver.status === 'en_route' ? 'En-route' : selectedDriver.status === 'towing' ? 'Towing' : 'Active'} />
            </div>

            {/* Profile Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {selectedDriver.name ? selectedDriver.name[0] : 'D'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F8FAFC' }}>{selectedDriver.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedDriver.phone}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-yellow)', marginTop: '2px', fontWeight: 600 }}>Rating {selectedDriver.rating || '5.0'} / 5.0</div>
              </div>
            </div>

            {/* Vehicle & Telemetry Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle Class:</span>
                <span style={{ fontWeight: 600 }}>{selectedDriver.vehicleType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>License Plate:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedDriver.vehiclePlate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Velocity:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontVariantNumeric: 'tabular-nums' }}>{selectedDriver.speed}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Live GPS:</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  {(selectedDriver.location?.lat || selectedDriver.latitude || 28.6139).toFixed(4)}°, {(selectedDriver.location?.lng || selectedDriver.longitude || 77.209).toFixed(4)}°
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => alert(`Calling driver ${selectedDriver.name} at ${selectedDriver.phone}`)}
                style={{
                  padding: '0.65rem',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '6px',
                  color: 'var(--accent-cyan)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Call Driver via Masked Line
              </button>
            </div>
          </GlassCard>
        ) : (
          <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Select a unit to inspect live telemetry
          </GlassCard>
        )}
      </div>
    </div>
  );
}
