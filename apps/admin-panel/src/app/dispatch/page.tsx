'use client';
import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { getNearbyDrivers, getPricingRules } from '@omnigo/api';

type DispatchRequest = any;
export default function DispatchCenterPage() {
  const [autoAssign, setAutoAssign] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [dispatchAlert, setDispatchAlert] = useState<string | null>(null);
  const [platformCommissionPercent, setPlatformCommissionPercent] = useState(10);

  useEffect(() => {
    async function fetchRules() {
      try {
        const rules = await getPricingRules();
        if (rules && rules.platformCommissionPercent) {
          setPlatformCommissionPercent(rules.platformCommissionPercent);
        }
      } catch (err) {
        console.error('Failed to load rules', err);
      }
    }
    fetchRules();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      getNearbyDrivers(selectedJob.pickup_lat || 0, selectedJob.pickup_lng || 0)
        .then(drivers => {
          if (drivers && Array.isArray(drivers) && drivers.length > 0) {
            setSelectedJob((prev: any) => prev && prev.id === selectedJob.id ? { ...prev, recommendedDrivers: drivers } : prev);
          }
        })
        .catch(console.error);
    }
  }, [selectedJob?.id]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dispatch');
        if (!res.ok) throw new Error('API error');
        const { queue: live } = await res.json();
        if (live && live.length > 0) {
          setJobs(live as any);
          setSelectedJob(live[0] as any);
        }
      } catch (e) {
        console.error('[Dispatch]', e);
      }
    }
    load();
    // Poll every 20s for new dispatch jobs
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleManualAssign = async (driverName: string) => {
    if (!selectedJob) return;
    // Optimistic UI update — dispatch via API in background
    try {
      await fetch('/api/dispatch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: selectedJob.id, driverName }) });
    } catch (e) { /* silently handle */ }
    setDispatchAlert(`Assigned ${driverName} to Request ${selectedJob.id}. Dispatch notification dispatched.`);
    setJobs(prev => prev.filter(j => j.id !== selectedJob.id));
    setSelectedJob(null);
    setTimeout(() => setDispatchAlert(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Auto-Dispatch Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Dispatch Engine & Routing
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Algorithmic proximity matching, queue prioritization, and manual dispatch overrides
          </p>
        </div>

        {/* Auto Dispatch Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '8px',
          border: '1px solid var(--glass-border)',
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Autonomous Matching Engine</div>
            <div style={{ fontSize: '0.72rem', color: autoAssign ? 'var(--accent-green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '3px', background: autoAssign ? 'var(--accent-green)' : 'var(--text-muted)' }} />
              {autoAssign ? 'Active · Proximity + Vehicle Weighting' : 'Paused · Manual Intervention Only'}
            </div>
          </div>
          <button
            onClick={() => setAutoAssign(!autoAssign)}
            style={{
              padding: '0.35rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              background: autoAssign ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
              color: autoAssign ? '#000' : '#fff',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            {autoAssign ? 'ACTIVE' : 'PAUSED'}
          </button>
        </div>
      </div>

      {dispatchAlert && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--accent-green-subtle)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '8px',
          color: 'var(--accent-green)',
          fontSize: '0.86rem',
          fontWeight: 600,
        }}>
          ✓ {dispatchAlert}
        </div>
      )}

      {/* Main Grid: Pending Queue (Left) + Selected Request Recommendation Inspector (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '1.5rem' }}>
        
        {/* Left Column: Pending Booking Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Pending Routing Queue ({jobs.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Real-time queue</span>
          </div>

          {jobs.length === 0 ? (
            <GlassCard style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No pending routing requests in queue.
            </GlassCard>
          ) : (
            jobs.map(job => {
              const isSelected = selectedJob?.id === job.id;
              const isSOS = job.urgency === 'Emergency SOS';
              return (
                <GlassCard
                  key={job.id}
                  style={{
                    padding: '1.2rem 1.3rem',
                    border: isSelected ? '1px solid var(--accent-cyan)' : isSOS ? '1px solid var(--accent-red)' : '1px solid var(--glass-border-subtle)',
                    background: isSelected ? 'rgba(56,189,248,0.04)' : isSOS ? 'rgba(244,63,94,0.04)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div onClick={() => setSelectedJob(job)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'monospace', color: '#F8FAFC' }}>{job.id}</span>
                        <StatusBadge status={isSOS ? 'High' : job.urgency === 'Urgent' ? 'Medium' : 'Low'} />
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>
                        {job.estimatedPrice}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '0.2rem' }}>
                      {job.customerName} · <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{job.customerPhone}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '0.65rem' }}>
                      {job.customerVehicle} · Required: {job.vehicleTypeRequired}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div>Origin: <span style={{ color: '#E2E8F0' }}>{job.pickup}</span></div>
                      <div>Destination: <span style={{ color: '#E2E8F0' }}>{job.dropoff}</span></div>
                      <div style={{ color: 'var(--text-muted)' }}>Distance: {job.distance}</div>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>

        {/* Right Column: Smart Driver Recommendation & Dispatch Actions */}
        {selectedJob ? (
          <GlassCard style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border-subtle)', paddingBottom: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Recommended Match Optimization
                </span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#F8FAFC', marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
                  Assignment Dossier: {selectedJob.id}
                </h3>
              </div>
              <StatusBadge status={selectedJob.urgency === 'Emergency SOS' ? 'High' : 'En-route'} />
            </div>

            {/* Smart Algorithm Top Driver Recommendations */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Algorithmic Candidate Ranking
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {selectedJob.recommendedDrivers.map((driver, index) => (
                  <div
                    key={driver.id}
                    style={{
                      padding: '0.9rem 1rem',
                      background: index === 0 ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      border: index === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--glass-border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F8FAFC' }}>{driver.name}</span>
                        {index === 0 && (
                          <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', fontSize: '0.68rem', fontWeight: 700 }}>
                            OPTIMAL MATCH
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {driver.vehiclePlate} · Rating {driver.rating}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                        Proximity: {driver.distance} km · Estimated ETA: {driver.eta} mins
                      </div>
                    </div>

                    <button
                      onClick={() => handleManualAssign(driver.name)}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '6px',
                        border: index === 0 ? 'none' : '1px solid var(--glass-border)',
                        background: index === 0 ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)',
                        color: index === 0 ? '#000' : '#fff',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      Assign Unit
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Fare Breakdown Preview for Dispatch */}
            <div style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border-subtle)', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer Gross Total:</span>
                <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{selectedJob.estimatedPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Platform Commission ({platformCommissionPercent}%):</span>
                <span style={{ color: 'var(--accent-red)' }}>-₹{Math.round(Number(selectedJob.estimatedPrice) * (platformCommissionPercent / 100))}.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Driver Take-Home:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>₹{Math.round(Number(selectedJob.estimatedPrice) * (1 - (platformCommissionPercent / 100)))}.00</span>
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select a pending request to review candidate ranking
          </GlassCard>
        )}
      </div>
    </div>
  );
}
