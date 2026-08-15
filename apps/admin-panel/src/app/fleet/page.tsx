'use client';
import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { liveFleetDrivers, LiveFleetDriver } from '@/lib/mock-data';

export default function FleetMapPage() {
  const [selectedDriver, setSelectedDriver] = useState<LiveFleetDriver | null>(liveFleetDrivers[0]);
  const [filter, setFilter] = useState<'all' | 'available' | 'en_route' | 'arrived' | 'towing' | 'sos' | 'offline'>('all');

  const filteredDrivers = liveFleetDrivers.filter(d => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const getStatusColor = (status: LiveFleetDriver['status']) => {
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
            Real-time GPS positioning, battery health, speed telemetry, and route active status
          </p>
        </div>

        {/* State Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          {[
            { id: 'all', label: 'All Units (7)', color: 'var(--text-secondary)' },
            { id: 'available', label: 'Available (2)', color: '#10B981' },
            { id: 'en_route', label: 'En-Route (1)', color: '#38BDF8' },
            { id: 'arrived', label: 'Arrived (1)', color: '#F59E0B' },
            { id: 'towing', label: 'Towing (1)', color: '#A855F7' },
            { id: 'sos', label: 'Emergency (1)', color: '#F43F5E' },
            { id: 'offline', label: 'Offline (1)', color: '#64748B' },
          ].map(tab => (
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

      {/* Main Grid: Driver List + Simulated Interactive Canvas + Inspector Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr 340px', gap: '1.25rem', flex: 1, minHeight: 0 }}>
        
        {/* Left Driver List */}
        <GlassCard style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Active Units ({filteredDrivers.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredDrivers.map(d => {
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
                    {d.vehiclePlate} · Rating {d.rating}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Center: Live GPS Map Radar Canvas */}
        <GlassCard style={{ padding: 0, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.04) 0%, transparent 60%),
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 36px 36px, 36px 36px',
            backgroundColor: '#070B14',
          }}>
            {/* Top Subtitle */}
            <div style={{ position: 'absolute', top: '1.25rem', left: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em' }}>
              GRID RADAR: SOUTH-WEST HIGHWAY CORRIDORS
            </div>

            {/* Render Simulated Fleet Pins */}
            {filteredDrivers.map((d, index) => {
              const isSelected = selectedDriver?.id === d.id;
              const color = getStatusColor(d.status);
              const positions = [
                { top: '35%', left: '42%' },
                { top: '25%', left: '60%' },
                { top: '65%', left: '55%' },
                { top: '48%', left: '28%' },
                { top: '75%', left: '40%' },
                { top: '30%', left: '78%' },
                { top: '20%', left: '35%' },
              ];
              const pos = positions[index % positions.length];

              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDriver(d)}
                  style={{
                    position: 'absolute',
                    top: pos.top,
                    left: pos.left,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: isSelected ? 20 : 10,
                  }}
                >
                  <div style={{
                    width: isSelected ? '38px' : '28px',
                    height: isSelected ? '38px' : '28px',
                    borderRadius: '50%',
                    background: `${color}25`,
                    border: `1.5px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 12px ${color}66`,
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '4px', background: color }} />
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '4px',
                    background: '#0B1120',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: '#F8FAFC',
                    whiteSpace: 'nowrap',
                    border: `1px solid rgba(255,255,255,0.1)`,
                  }}>
                    {d.name.split(' ')[0]} ({d.speed})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Bottom Telemetry Legend */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            background: 'rgba(13,19,34,0.9)',
            border: '1px solid var(--glass-border)',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(10px)',
          }}>
            <div>Target: <strong>Bangalore East (12.9716° N, 77.5946° E)</strong></div>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <span>Telemetry: <strong style={{ color: 'var(--accent-green)' }}>Real-time 100%</strong></span>
              <span>Sync Rate: <strong>2.0s</strong></span>
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
                {selectedDriver.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F8FAFC' }}>{selectedDriver.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedDriver.phone}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-yellow)', marginTop: '2px', fontWeight: 600 }}>Rating {selectedDriver.rating} / 5.0</div>
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
                <span style={{ color: 'var(--text-muted)' }}>Terminal Battery:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-green)', fontVariantNumeric: 'tabular-nums' }}>{selectedDriver.battery}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>GPS Target:</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{selectedDriver.lat}, {selectedDriver.lng}</span>
              </div>
            </div>

            {/* Active Destination Card */}
            {selectedDriver.destination && (
              <div style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.05)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  ACTIVE ASSIGNMENT: {selectedDriver.activeJobId}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{selectedDriver.destination}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '0.25rem', fontWeight: 600 }}>ETA: {selectedDriver.eta}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button style={{
                padding: '0.65rem',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '6px',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}>
                Call Driver via Masked Line
              </button>
              <button style={{
                padding: '0.65rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--glass-border)',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}>
                Re-route Dispatch
              </button>
            </div>
          </GlassCard>
        ) : (
          <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select a unit to inspect telemetry
          </GlassCard>
        )}
      </div>
    </div>
  );
}
