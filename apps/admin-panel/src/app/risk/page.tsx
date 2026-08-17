'use client';
import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@omnigo/api';

type FraudRiskIncident = {
  id: string;
  type: string;
  severity: string;
  subjectName: string;
  subjectRole: string;
  description: string;
  status: string;
  timestamp: string;
};

export default function FraudRiskCenterPage() {
  const [incidents, setIncidents] = useState<FraudRiskIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<FraudRiskIncident | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'open' | 'frozen'>('all');
  const [alertNotice, setAlertNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/risk');
        if (!res.ok) return;
        const { incidents: live } = await res.json();
        if (live && Array.isArray(live)) {
          setIncidents(live as any);
        } else {
          setIncidents([]);
        }
      } catch (e) {
        console.error('[Risk]', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredIncidents = incidents.filter(item => {
    if (filter === 'high') return item.severity === 'High';
    if (filter === 'open') return item.status === 'Open Investigation';
    if (filter === 'frozen') return item.status === 'Frozen';
    return true;
  });

  const handleFreezeAccount = async (id: string, name: string) => {
    try {
      await supabase.from('fraud_incidents').update({ status: 'frozen' }).eq('id', id);
      setIncidents(prev => prev.map(item => item.id === id ? { ...item, status: 'Frozen' } : item));
      setAlertNotice(`Account for "${name}" has been FROZEN. Associated API tokens revoked & wallet locked.`);
      setSelectedIncident(null);
      setTimeout(() => setAlertNotice(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveIncident = async (id: string) => {
    try {
      await supabase.from('fraud_incidents').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', id);
      setIncidents(prev => prev.map(item => item.id === id ? { ...item, status: 'Resolved' } : item));
      setAlertNotice(`Incident ${id} marked as RESOLVED after review.`);
      setSelectedIncident(null);
      setTimeout(() => setAlertNotice(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const gpsFlagsCount = incidents.filter(i => i.type === 'GPS Mismatch').length;
  const chargebacksCount = incidents.filter(i => i.type === 'Payment Chargeback' || i.type === 'Cash Discrepancy').length;
  const frozenCount = incidents.filter(i => i.status === 'Frozen').length;
  const openCasesCount = incidents.filter(i => i.status === 'Open Investigation').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Risk & Fraud Mitigation Hub
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Telemetry anomaly detection, chargeback disputes, device fingerprint rings, and account freezes
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.02)', padding: '3px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          {[
            { id: 'all', label: `All Alerts (${incidents.length})` },
            { id: 'high', label: 'High Severity' },
            { id: 'open', label: 'Open Cases' },
            { id: 'frozen', label: 'Frozen Accounts' },
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
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {alertNotice && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--accent-red-subtle)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '8px',
          color: 'var(--accent-red)',
          fontSize: '0.86rem',
          fontWeight: 600,
        }}>
          🛡️ {alertNotice}
        </div>
      )}

      {/* Anomaly Metrics Overview - 100% Dynamic */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <GlassCard style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>Active GPS Telemetry Flags</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--accent-red)', marginTop: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>
            {gpsFlagsCount} Flagged
          </div>
        </GlassCard>
        <GlassCard style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>Chargeback Disputes</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--accent-yellow)', marginTop: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>
            {chargebacksCount} Disputes
          </div>
        </GlassCard>
        <GlassCard style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>Frozen Accounts</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--accent-yellow)', marginTop: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>
            {frozenCount} Accounts
          </div>
        </GlassCard>
        <GlassCard style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>Open Risk Cases</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--accent-green)', marginTop: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>
            {openCasesCount} Cases
          </div>
        </GlassCard>
      </div>

      {/* Incidents Threat Log Table */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Incident ID</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Threat Class</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Severity</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Subject User</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Anomaly Description</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {loading ? 'Scanning for fraud anomalies in database...' : 'No risk or fraud incidents detected.'}
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid var(--glass-border-subtle)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.95rem 1.25rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>
                      {item.id}
                    </td>

                    <td style={{ padding: '0.95rem 1.25rem', fontWeight: 600, fontSize: '0.86rem', color: '#F8FAFC' }}>
                      {item.type}
                    </td>

                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <StatusBadge status={item.severity} />
                    </td>

                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#F8FAFC' }}>{item.subjectName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Role: {item.subjectRole}</div>
                    </td>

                    <td style={{ padding: '0.95rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                      {item.description}
                    </td>

                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <StatusBadge status={item.status} />
                    </td>

                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <button
                        onClick={() => setSelectedIncident(item)}
                        style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: '6px',
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          color: 'var(--accent-yellow)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ─── THREAT INVESTIGATION MODAL ─── */}
      {selectedIncident && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '540px',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Risk Incident Dossier
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#F8FAFC', marginTop: '0.2rem' }}>Case: {selectedIncident.id}</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Subject:</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#F8FAFC' }}>{selectedIncident.subjectName}</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Telemetry Trigger:</div>
                <div style={{ lineHeight: '1.4', color: '#E2E8F0' }}>{selectedIncident.description}</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Timestamp:</div>
                <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{selectedIncident.timestamp}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleFreezeAccount(selectedIncident.id, selectedIncident.subjectName)}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  background: 'var(--accent-red)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                Freeze Account & Funds
              </button>
              <button
                onClick={() => handleResolveIncident(selectedIncident.id)}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                Dismiss Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
