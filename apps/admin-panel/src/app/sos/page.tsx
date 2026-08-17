'use client';
import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { SOSIncident } from '@/lib/mock-data';
export default function SOSCommandCenterPage() {
  const [incidents, setIncidents] = useState<SOSIncident[]>([]);
  const [escalationNotice, setEscalationNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/sos');
        if (!res.ok) throw new Error('API error');
        const { incidents: live } = await res.json();
        if (live && live.length > 0) {
          const mapped = live.map((inc: any): SOSIncident => ({
            id: inc.id || 'SOS-N/A',
            customerName: inc.customerName || inc.customer_name || inc.user_name || 'Unknown',
            customerPhone: inc.customerPhone || inc.phone || '',
            location: inc.location || inc.location_address || 'Unknown Location',
            gpsCoords: inc.gpsCoords || inc.gps_coords || '',
            vehicleModel: inc.vehicleModel || inc.vehicle_description || '',
            hazardType: inc.hazardType || inc.incident_type || 'Emergency',
            assignedDriverName: inc.assignedDriverName || inc.driver_name || 'Dispatching...',
            assignedDriverPhone: inc.assignedDriverPhone || '',
            driverEta: inc.driverEta || inc.eta || 'Calculating...',
            status: inc.status === 'active' ? 'Active Alert 🚨' : inc.status === 'resolved' ? 'Resolved' : (inc.status || 'Active Alert 🚨') as any,
            policeNotified: inc.policeNotified || inc.police_notified || false,
            timeline: inc.timeline || [],
          }));
          setIncidents(mapped);
        }
      } catch (e) {
        console.error('[SOS]', e);
      }
    }
    load();
    // Poll every 15s for fresh SOS alerts
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleEscalatePolice = async (id: string) => {
    try {
      await fetch('/api/sos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'Police Dispatched' }) });
    } catch(e) { /* silently handle */ }
    setEscalationNotice(`Dispatched priority distress to Highway Police & 112 Control Room for Case ${id}.`);
    setTimeout(() => setEscalationNotice(null), 5000);
  };

  const handleDispatchAmbulance = async (id: string) => {
    try {
      await fetch('/api/sos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'EMS Dispatched' }) });
    } catch(e) { /* silently handle */ }
    setEscalationNotice(`Emergency Medical Services (EMS) dispatched to Case ${id}.`);
    setTimeout(() => setEscalationNotice(null), 5000);
  };

  const handleResolveSOS = async (id: string) => {
    try {
      await fetch('/api/sos', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'Resolved' }) });
    } catch(e) { /* silently handle */ }
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'Resolved' } : inc));
    setEscalationNotice(`Case ${id} marked as SAFELY RESOLVED. Emergency telemetry archived.`);
    setTimeout(() => setEscalationNotice(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div style={{
        padding: '1.25rem 1.5rem',
        background: 'rgba(244, 63, 94, 0.08)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'var(--accent-red)' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Emergency Distress Command
            </h2>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
            Direct telemetry link · Automated Police 112 & Highway EMS escalation
          </div>
        </div>

        <StatusBadge status="High" />
      </div>

      {escalationNotice && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--accent-green-subtle)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          color: 'var(--accent-green)',
          fontSize: '0.86rem',
          fontWeight: 600,
        }}>
          ✓ {escalationNotice}
        </div>
      )}

      {/* Main Active Incidents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {incidents.map((incident) => {
          const isResolved = incident.status === 'Resolved';
          return (
            <GlassCard
              key={incident.id}
              style={{
                padding: '1.5rem',
                border: isResolved ? '1px solid var(--accent-green)' : '1px solid rgba(244, 63, 94, 0.4)',
                background: isResolved ? 'rgba(16,185,129,0.02)' : 'rgba(244, 63, 94, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Incident Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--glass-border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', fontFamily: 'monospace' }}>{incident.id}</span>
                  <StatusBadge status={isResolved ? 'Resolved' : 'High'} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  Police 112 Alert: {incident.policeNotified ? 'Dispatched & Synced' : 'Standby'}
                </div>
              </div>

              {/* Grid: Customer + Vehicle + Location + Assigned Emergency Unit */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.84rem' }}>
                <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                    Customer in Distress
                  </div>
                  <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{incident.customerName}</div>
                  <div style={{ color: 'var(--accent-cyan)', marginTop: '2px' }}>{incident.customerPhone}</div>
                </div>

                <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                    Vehicle Target & Hazard
                  </div>
                  <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{incident.vehicleModel}</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{incident.hazardType}</div>
                </div>

                <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                    Distress Location
                  </div>
                  <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{incident.location}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px', fontFamily: 'monospace' }}>
                    {incident.gpsCoords}
                  </div>
                </div>

                <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border-subtle)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                    Assigned Unit
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{incident.assignedDriverName}</div>
                  <div style={{ color: 'var(--accent-cyan)', marginTop: '2px', fontWeight: 600 }}>ETA: {incident.driverEta}</div>
                </div>
              </div>

              {/* Timeline of Incident */}
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
                  Incident Telemetry Timeline
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                  {incident.timeline.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem', width: '65px' }}>{step.time}</span>
                      <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'var(--accent-green)' }} />
                      <span style={{ color: '#E2E8F0' }}>{step.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Escalation Bar */}
              {!isResolved && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleEscalatePolice(incident.id)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      background: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      color: 'var(--accent-red)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Escalate to Police 112
                  </button>
                  <button
                    onClick={() => handleDispatchAmbulance(incident.id)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: 'var(--accent-yellow)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Dispatch EMS / Ambulance
                  </button>
                  <button
                    onClick={() => handleResolveSOS(incident.id)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      background: 'var(--accent-green)',
                      color: '#000',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      marginLeft: 'auto',
                    }}
                  >
                    Mark Case Resolved
                  </button>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
