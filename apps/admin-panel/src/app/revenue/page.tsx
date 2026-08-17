'use client';
import React, { useState, useEffect } from 'react';
import StatsCard from '@/components/StatsCard';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from '@/components/Charts';
import { createSettlement } from '@omnigo/api';

interface AuditRow {
  bookingId: string;
  customerName: string;
  paymentId: string;
  gatewayMethod: string;
  customerPaid: string;
  commission: string;
  partnerEarning: string;
  tip: string;
  settlementId: string;
  payoutStatus: 'Settled & Paid' | 'Pending Clearance' | 'Processing';
  utr: string;
  date: string;
  route: string;
}

export default function RevenuePage() {
  const [selectedAudit, setSelectedAudit] = useState<AuditRow | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'settled'>('all');
  const [settlementNotice, setSettlementNotice] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<AuditRow[]>([]);
  const [revData, setRevData] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ totalGMV: number; omniGoRevenue: number; driverPayouts: number; pendingEscrow: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/revenue');
        if (!res.ok) throw new Error('API error');
        const { entries, summary: sum } = await res.json();
        
        if (entries && Array.isArray(entries)) {
          const mapped: AuditRow[] = entries.map((e: any) => ({
            bookingId: e.bookingId || e.booking_id || e.booking_number || '—',
            customerName: e.customerName || e.customer_name || '—',
            paymentId: e.paymentId || e.payment_id || '—',
            gatewayMethod: e.gatewayMethod || e.payment_method || 'UPI (Escrow)',
            customerPaid: typeof e.customerPaid === 'string' ? e.customerPaid : `₹${Number(e.gross_customer_fare || 0).toLocaleString('en-IN')}`,
            commission: typeof e.omniGoTake === 'string' ? e.omniGoTake : typeof e.commission === 'string' ? e.commission : `₹${Number(e.commission_amount || 0).toLocaleString('en-IN')}`,
            partnerEarning: typeof e.partnerPayable === 'string' ? e.partnerPayable : typeof e.partnerEarning === 'string' ? e.partnerEarning : `₹${Number(e.driver_net_earning || 0).toLocaleString('en-IN')}`,
            tip: typeof e.tip === 'string' ? e.tip : `₹${Number(e.customer_tip || 0).toLocaleString('en-IN')}`,
            settlementId: e.ledgerNumber || e.ledger_number || e.settlementId || '—',
            payoutStatus: (e.payoutStatus || (e.settlement_status === 'settled' ? 'Settled & Paid' : 'Pending Clearance')) as any,
            utr: e.utrNumber || e.utr || '—',
            date: e.date || (e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN') : '—'),
            route: e.route || (e.pickup_address && e.dropoff_address ? `${e.pickup_address} ➔ ${e.dropoff_address}` : '—'),
          }));
          setAuditData(mapped);
        } else {
          setAuditData([]);
        }

        if (sum) {
          setSummary({
            totalGMV: Number(sum.totalGMV || 0),
            omniGoRevenue: Number(sum.omniGoRevenue || 0),
            driverPayouts: Number(sum.driverPayouts || 0),
            pendingEscrow: Number(sum.pendingEscrow || 0),
          });
        }

        // Also fetch revenue chart data
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const { revenue: rData } = await statsRes.json();
          if (rData && Array.isArray(rData)) setRevData(rData);
        }
      } catch (e) {
        console.error('[Revenue]', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredData = auditData.filter(row => {
    if (filter === 'pending') return row.payoutStatus === 'Pending Clearance';
    if (filter === 'settled') return row.payoutStatus === 'Settled & Paid';
    return true;
  });

  const handleTriggerSettlement = async () => {
    try {
      await createSettlement({ type: 'batch' });
      setSettlementNotice('Batch Settlement Processed: Triggered clearance check on all pending escrow entries.');
      setTimeout(() => setSettlementNotice(null), 5000);
    } catch (err) {
      setSettlementNotice('Failed to trigger settlement batch.');
      setTimeout(() => setSettlementNotice(null), 5000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Financial Ledger & Settlement Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            OmniGo Double-Entry Ledger · Escrow Gateway · Partner Settlements & Automated Payouts
          </p>
        </div>

        <button
          onClick={handleTriggerSettlement}
          style={{
            padding: '0.6rem 1.25rem',
            background: 'var(--accent-green)',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.82rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
          }}
        >
          Execute Settlement Batch
        </button>
      </div>

      {settlementNotice && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--accent-green-subtle)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          color: 'var(--accent-green)',
          fontSize: '0.86rem',
          fontWeight: 600,
        }}>
          ✓ {settlementNotice}
        </div>
      )}

      {/* Architecture Pipeline Banner */}
      <GlassCard style={{ padding: '1rem 1.25rem', background: 'rgba(56, 189, 248, 0.03)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Mandatory Escrow Settlement Pipeline
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#F8FAFC' }}>
          <span style={{ background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--glass-border-subtle)' }}>1. Customer Payment</span>
          <span style={{ color: 'var(--text-muted)' }}>➔</span>
          <span style={{ background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--glass-border-subtle)' }}>2. Booking ID</span>
          <span style={{ color: 'var(--text-muted)' }}>➔</span>
          <span style={{ background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--glass-border-subtle)' }}>3. Payment ID</span>
          <span style={{ color: 'var(--text-muted)' }}>➔</span>
          <span style={{ background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--glass-border-subtle)' }}>4. OmniGo Commission (10%)</span>
          <span style={{ color: 'var(--text-muted)' }}>➔</span>
          <span style={{ background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--glass-border-subtle)' }}>5. Partner Earning</span>
          <span style={{ color: 'var(--text-muted)' }}>➔</span>
          <span style={{ background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--glass-border-subtle)' }}>6. Settlement Batch</span>
          <span style={{ color: 'var(--text-muted)' }}>➔</span>
          <span style={{ background: 'var(--accent-green-subtle)', color: 'var(--accent-green)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, border: '1px solid rgba(16,185,129,0.3)' }}>7. Bank Payout (UTR)</span>
        </div>
      </GlassCard>

      {/* KPI Stats Cards - Real Data from DB */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatsCard title="Gross Gateway Volume" value={`₹${(summary?.totalGMV ?? 0).toLocaleString('en-IN')}`} trend="Live Gateway Volume" />
        <StatsCard title="OmniGo Net Commission" value={`₹${(summary?.omniGoRevenue ?? 0).toLocaleString('en-IN')}`} trend="Platform Net Revenue" />
        <StatsCard title="Partner Settlements Paid" value={`₹${(summary?.driverPayouts ?? 0).toLocaleString('en-IN')}`} trend="Disbursed to Partners" />
        <StatsCard title="Active Escrow In-Transit" value={`₹${(summary?.pendingEscrow ?? 0).toLocaleString('en-IN')}`} trend="Pending Clearance" />
      </div>

      {/* Revenue Trend Chart */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Daily Gross vs Commission Volume</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>100% processed through OmniGo Master Escrow</p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-green)' }}>Live Ingestion</span>
        </div>
        <div style={{ height: '280px' }}>
          {revData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="revenue" stroke="var(--accent-cyan)" strokeWidth={2.5} name="Total Volume (₹)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No historical revenue entries recorded yet in ledger
            </div>
          )}
        </div>
      </GlassCard>

      {/* End-to-End Audit Trail Table */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>End-to-End Payment Audit Trail</h3>
            <p style={{ margin: 0, marginTop: '2px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Full financial lifecycle with Booking ID, Payment ID, Commission Split, Settlement & UTR
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.02)', padding: '3px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: filter === 'all' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: filter === 'all' ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All ({auditData.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: filter === 'pending' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: filter === 'pending' ? 'var(--accent-yellow)' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Pending Settlement
            </button>
            <button
              onClick={() => setFilter('settled')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: filter === 'settled' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: filter === 'settled' ? 'var(--accent-green)' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Settled Payouts
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Booking ID</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Payment ID</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Customer Paid</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Commission</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Partner Net</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Settlement Batch</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Payout / UTR</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {loading ? 'Fetching ledger records from database...' : 'No ledger transactions recorded in database yet.'}
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.bookingId + row.paymentId}
                    style={{ borderBottom: '1px solid var(--glass-border-subtle)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.95rem 1.25rem', fontWeight: 600, fontSize: '0.86rem', color: '#F8FAFC' }}>{row.bookingId}</td>
                    <td style={{ padding: '0.95rem 1.25rem', color: 'var(--accent-cyan)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {row.paymentId}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.gatewayMethod}</div>
                    </td>
                    <td style={{ padding: '0.95rem 1.25rem', fontWeight: 600, fontSize: '0.88rem', fontVariantNumeric: 'tabular-nums' }}>{row.customerPaid}</td>
                    <td style={{ padding: '0.95rem 1.25rem', color: 'var(--accent-red)', fontWeight: 600, fontSize: '0.84rem', fontVariantNumeric: 'tabular-nums' }}>-{row.commission}</td>
                    <td style={{ padding: '0.95rem 1.25rem', color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.88rem', fontVariantNumeric: 'tabular-nums' }}>
                      {row.partnerEarning}
                      {row.tip !== '₹0' && row.tip !== '₹0.00' && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}> (+{row.tip} tip)</span>}
                    </td>
                    <td style={{ padding: '0.95rem 1.25rem', fontSize: '0.8rem', fontFamily: 'monospace', color: '#E2E8F0' }}>{row.settlementId}</td>
                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <StatusBadge status={row.payoutStatus} />
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                        {row.utr}
                      </div>
                    </td>
                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <button
                        onClick={() => setSelectedAudit(row)}
                        style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: '6px',
                          background: 'rgba(56,189,248,0.08)',
                          border: '1px solid rgba(56,189,248,0.25)',
                          color: 'var(--accent-cyan)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Audit Trail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ─── 7-STEP AUDIT TRAIL MODAL ─── */}
      {selectedAudit && (
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
            maxWidth: '580px',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Transaction Lifecycle
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#F8FAFC', marginTop: '0.2rem' }}>Audit Trail: {selectedAudit.bookingId}</h3>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>1. Customer Payment:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{selectedAudit.customerPaid} via {selectedAudit.gatewayMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>2. Booking Reference:</span>
                <span style={{ fontWeight: 500 }}>{selectedAudit.bookingId} ({selectedAudit.route})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>3. Master Gateway Order ID:</span>
                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', fontWeight: 600 }}>{selectedAudit.paymentId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>4. OmniGo Commission Split:</span>
                <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>-{selectedAudit.commission}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>5. Partner Net Earning:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{selectedAudit.partnerEarning} (+{selectedAudit.tip} tip)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>6. Partner Settlement Batch:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedAudit.settlementId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>7. Bank Payout Disbursed:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontFamily: 'monospace' }}>{selectedAudit.utr}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedAudit(null)}
              style={{
                width: '100%',
                marginTop: '1.25rem',
                padding: '0.65rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
