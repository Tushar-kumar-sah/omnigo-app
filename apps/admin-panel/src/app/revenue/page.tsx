'use client';
import React, { useState } from 'react';
import StatsCard from '@/components/StatsCard';
import GlassCard from '@/components/GlassCard';
import { revenueData } from '@/lib/mock-data';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

const AUDIT_DATA: AuditRow[] = [
  {
    bookingId: 'JOB-7821',
    customerName: 'Rahul Sharma',
    paymentId: 'PAY-OMNI-7821',
    gatewayMethod: 'UPI (GPay)',
    customerPaid: '₹850',
    commission: '₹85 (10%)',
    partnerEarning: '₹765',
    tip: '₹150',
    settlementId: 'SETTLE-8910',
    payoutStatus: 'Pending Clearance',
    utr: 'Scheduled Tuesday',
    date: '15 Aug 2026, 2:30 PM',
    route: 'MG Road ➔ Whitefield, Bangalore',
  },
  {
    bookingId: 'JOB-7802',
    customerName: 'Priya Sharma',
    paymentId: 'PAY-OMNI-7802',
    gatewayMethod: 'Card (Visa ••4012)',
    customerPaid: '₹1,200',
    commission: '₹120 (10%)',
    partnerEarning: '₹1,080',
    tip: '₹0',
    settlementId: 'SETTLE-8821',
    payoutStatus: 'Settled & Paid',
    utr: 'UTR9928172648',
    date: '14 Aug 2026, 10:15 AM',
    route: 'Pimpri ➔ Hinjawadi, Pune',
  },
  {
    bookingId: 'JOB-7798',
    customerName: 'Sneha Patil',
    paymentId: 'PAY-OMNI-7798',
    gatewayMethod: 'UPI (PhonePe)',
    customerPaid: '₹950',
    commission: '₹95 (10%)',
    partnerEarning: '₹855',
    tip: '₹100',
    settlementId: 'SETTLE-8821',
    payoutStatus: 'Settled & Paid',
    utr: 'UTR9928172648',
    date: '13 Aug 2026, 4:45 PM',
    route: 'Koregaon Park ➔ Hadapsar',
  },
  {
    bookingId: 'JOB-7750',
    customerName: 'Amit Verma',
    paymentId: 'PAY-OMNI-7750',
    gatewayMethod: 'Card (Mastercard)',
    customerPaid: '₹2,400',
    commission: '₹240 (10%)',
    partnerEarning: '₹2,160',
    tip: '₹200',
    settlementId: 'SETTLE-8821',
    payoutStatus: 'Settled & Paid',
    utr: 'UTR9928172648',
    date: '12 Aug 2026, 11:20 AM',
    route: 'Viman Nagar ➔ Baner',
  },
  {
    bookingId: 'JOB-7710',
    customerName: 'Karan Mehra',
    paymentId: 'PAY-OMNI-7710',
    gatewayMethod: 'UPI (Paytm)',
    customerPaid: '₹3,200',
    commission: '₹320 (10%)',
    partnerEarning: '₹2,880',
    tip: '₹0',
    settlementId: 'SETTLE-8821',
    payoutStatus: 'Settled & Paid',
    utr: 'UTR9928172648',
    date: '11 Aug 2026, 6:10 PM',
    route: 'Aundh ➔ Urse Toll Plaza',
  },
];

export default function RevenuePage() {
  const [selectedAudit, setSelectedAudit] = useState<AuditRow | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'settled'>('all');
  const [settlementNotice, setSettlementNotice] = useState<string | null>(null);

  const filteredData = AUDIT_DATA.filter(row => {
    if (filter === 'pending') return row.payoutStatus === 'Pending Clearance';
    if (filter === 'settled') return row.payoutStatus === 'Settled & Paid';
    return true;
  });

  const handleTriggerSettlement = () => {
    setSettlementNotice('Batch Settlement Triggered! ₹915.00 scheduled for automated IMPS disbursement.');
    setTimeout(() => setSettlementNotice(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Revenue & Ledger Architecture</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            OmniGo Double-Entry Ledger · Escrow Gateway · Partner Settlements & Payouts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleTriggerSettlement}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'linear-gradient(135deg, var(--accent-green), #00CC7A)',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ⚡ Trigger Settlement Batch
          </button>
        </div>
      </div>

      {settlementNotice && (
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(0, 255, 151, 0.1)',
          border: '1px solid rgba(0, 255, 151, 0.3)',
          borderRadius: '8px',
          color: 'var(--accent-green)',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}>
          ✓ {settlementNotice}
        </div>
      )}

      {/* Architecture Pipeline Banner */}
      <GlassCard style={{ padding: '1.25rem', border: '1px solid rgba(0, 207, 255, 0.25)', background: 'rgba(0, 207, 255, 0.03)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '1px', marginBottom: '0.5rem' }}>
          MANDATORY PAYMENT & SETTLEMENT PIPELINE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#fff' }}>
          <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 8px', borderRadius: '4px' }}>1. Customer Payment (Gateway)</span>
          <span style={{ color: 'var(--accent-cyan)' }}>➔</span>
          <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 8px', borderRadius: '4px' }}>2. Booking ID</span>
          <span style={{ color: 'var(--accent-cyan)' }}>➔</span>
          <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 8px', borderRadius: '4px' }}>3. Payment ID</span>
          <span style={{ color: 'var(--accent-cyan)' }}>➔</span>
          <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 8px', borderRadius: '4px' }}>4. OmniGo Commission (10%)</span>
          <span style={{ color: 'var(--accent-cyan)' }}>➔</span>
          <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 8px', borderRadius: '4px' }}>5. Partner Earning</span>
          <span style={{ color: 'var(--accent-cyan)' }}>➔</span>
          <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 8px', borderRadius: '4px' }}>6. Settlement Batch</span>
          <span style={{ color: 'var(--accent-cyan)' }}>➔</span>
          <span style={{ background: 'rgba(0,255,151,0.15)', color: 'var(--accent-green)', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>7. Bank Payout (UTR)</span>
        </div>
      </GlassCard>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <StatsCard title="Gross Gateway Volume" value="₹12,45,000" trend="+15% (100% Gateway)" />
        <StatsCard title="OmniGo Net Commission" value="₹1,85,000" trend="+12.4% Revenue" />
        <StatsCard title="Partner Settlements Paid" value="₹9,98,000" trend="Automated IMPS/NEFT" />
        <StatsCard title="Active Escrow In-Transit" value="₹84,200" trend="Held for Verification" />
      </div>

      {/* Revenue Trend Chart */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1.1rem' }}>OmniGo Daily Gateway vs Commission Volume</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>● 100% Direct Gateway Ingestion</span>
        </div>
        <div style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--accent-cyan)" strokeWidth={3} name="Total Volume (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* End-to-End Audit Trail Table */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Complete End-to-End Payment Audit Trail</h3>
            <p style={{ margin: 0, marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Every transaction recorded with Booking ID, Payment ID, Commission Split, Settlement & UTR
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--glass-border)',
                background: filter === 'all' ? 'rgba(0,207,255,0.15)' : 'transparent',
                color: filter === 'all' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              All ({AUDIT_DATA.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--glass-border)',
                background: filter === 'pending' ? 'rgba(255,214,10,0.15)' : 'transparent',
                color: filter === 'pending' ? '#FFD60A' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Pending Settlement
            </button>
            <button
              onClick={() => setFilter('settled')}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--glass-border)',
                background: filter === 'settled' ? 'rgba(0,255,151,0.15)' : 'transparent',
                color: filter === 'settled' ? 'var(--accent-green)' : 'var(--text-secondary)',
                fontSize: '0.8rem',
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
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Booking ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Payment ID</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Customer Paid</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>OmniGo Commission</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Partner Net</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Settlement Batch</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Payout / UTR</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Audit Trail</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.bookingId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>{row.bookingId}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {row.paymentId}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.gatewayMethod}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, fontSize: '0.95rem' }}>{row.customerPaid}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent-red)', fontWeight: 600, fontSize: '0.9rem' }}>-{row.commission}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent-green)', fontWeight: 700, fontSize: '0.95rem' }}>
                    {row.partnerEarning}
                    {row.tip !== '₹0' && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}> (+{row.tip} tip)</span>}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>{row.settlementId}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '100px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: row.payoutStatus === 'Settled & Paid' ? 'rgba(0,255,151,0.12)' : 'rgba(255,214,10,0.12)',
                      color: row.payoutStatus === 'Settled & Paid' ? 'var(--accent-green)' : '#FFD60A',
                    }}>
                      {row.payoutStatus}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'monospace' }}>
                      {row.utr}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => setSelectedAudit(row)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        background: 'rgba(0, 207, 255, 0.1)',
                        border: '1px solid rgba(0, 207, 255, 0.3)',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      View Trail 🔍
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ─── 7-STEP AUDIT TRAIL MODAL ─── */}
      {selectedAudit && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>🔍 End-to-End Transaction Trail</h3>
              <button
                onClick={() => setSelectedAudit(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Full financial lifecycle for Booking <strong>{selectedAudit.bookingId}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>1. Customer Payment:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{selectedAudit.customerPaid} via {selectedAudit.gatewayMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>2. Booking Reference:</span>
                <span style={{ fontWeight: 600 }}>{selectedAudit.bookingId} ({selectedAudit.route})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>3. Gateway Payment ID:</span>
                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', fontWeight: 600 }}>{selectedAudit.paymentId} (Captured)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>4. OmniGo Commission Split:</span>
                <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>-{selectedAudit.commission}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>5. Partner Net Earning:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{selectedAudit.partnerEarning} (+{selectedAudit.tip} tip)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>6. Partner Settlement Batch:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedAudit.settlementId} ({selectedAudit.payoutStatus})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>7. Bank Payout & UTR:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{selectedAudit.utr}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedAudit(null)}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Close Audit Trail
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
