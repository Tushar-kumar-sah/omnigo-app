'use client';
import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { updateUser, updateWalletBalance } from '@omnigo/api';

type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  membershipTier: string;
  walletBalance: string;
  totalSpend: string;
  totalBookings: number;
  status: string;
  savedVehicles: string[];
  joinedDate: string;
  ratingGiven: number;
  rating?: number;
};
export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'members' | 'suspended'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('API error');
        const { users: live } = await res.json();
        if (live && live.length > 0) {
          const mapped = live.map((u: any): CustomerRecord => ({
            id: u.id || 'N/A',
            name: u.name || 'Unknown',
            phone: u.phone || '',
            email: u.email || '',
            membershipTier: u.membershipTier || u.membership_tier || 'Basic',
            walletBalance: u.walletBalance || `₹${Number(u.wallet_balance || 0).toLocaleString('en-IN')}`,
            totalSpend: u.totalSpend || u.total_spend || '₹0',
            totalBookings: u.totalBookings || u.total_bookings || 0,
            status: u.status || 'Active',
            savedVehicles: u.savedVehicles || u.saved_vehicles || [],
            joinedDate: u.joinedDate || u.joined_date || u.created_at || '',
            ratingGiven: Number(u.ratingGiven || u.rating_given || 5.0),
          }));
          setCustomers(mapped);
        }
      } catch (e) { console.error('[Users]', e); }
    }
    load();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || c.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) || c.phone?.includes(searchTerm);
    if (!matchesSearch) return false;
    if (filter === 'members') return c.membershipTier === 'Pro' || c.membershipTier === 'Elite';
    if (filter === 'suspended') return c.status === 'Suspended';
    return true;
  });

  const handleUpgradeTier = async (customerId: string, newTier: CustomerRecord['membershipTier']) => {
    try {
      await updateUser(customerId, { membershipTier: newTier });
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, membershipTier: newTier } : c));
      setAlertNotice(`Updated customer ${customerId} membership tier to ${newTier}.`);
      setSelectedCustomer(null);
      setTimeout(() => setAlertNotice(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueWalletCredit = async (customerId: string, amount: number) => {
    try {
      await updateWalletBalance(customerId, amount);
      setAlertNotice(`Issued ₹${amount}.00 OmniGo Wallet credit adjustment to Customer ${customerId}.`);
      setSelectedCustomer(null);
      setTimeout(() => setAlertNotice(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Customer & Membership Roster
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            User profiles, registered vehicle portfolios, subscription tiers, and ledger adjustments
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '220px' }}
          />

          <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.02)', padding: '3px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            {[
              { id: 'all', label: `All (${customers.length})` },
              { id: 'members', label: 'Pro / Elite Members' },
              { id: 'suspended', label: 'Suspended' },
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
      </div>

      {alertNotice && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--accent-green-subtle)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '8px',
          color: 'var(--accent-green)',
          fontSize: '0.86rem',
          fontWeight: 600,
        }}>
          ✓ {alertNotice}
        </div>
      )}

      {/* Customer Directory Table */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Customer Name</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Tier</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Registered Vehicles</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Total Bookings</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Total Spend</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Wallet Balance</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No registered customers found in database.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid var(--glass-border-subtle)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                  <td style={{ padding: '0.95rem 1.25rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#F8FAFC' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone} · {c.email}</div>
                  </td>

                  <td style={{ padding: '0.95rem 1.25rem' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: c.membershipTier === 'Elite' ? 'rgba(245,158,11,0.12)' : c.membershipTier === 'Pro' ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)',
                      color: c.membershipTier === 'Elite' ? 'var(--accent-yellow)' : c.membershipTier === 'Pro' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      border: `1px solid ${c.membershipTier === 'Elite' ? 'rgba(245,158,11,0.3)' : c.membershipTier === 'Pro' ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      {c.membershipTier}
                    </span>
                  </td>

                  <td style={{ padding: '0.95rem 1.25rem', fontSize: '0.82rem' }}>
                    {c.savedVehicles.map((v, i) => (
                      <div key={i} style={{ color: '#E2E8F0', fontSize: '0.78rem' }}>
                        {v}
                      </div>
                    ))}
                  </td>

                  <td style={{ padding: '0.95rem 1.25rem', fontSize: '0.86rem', fontVariantNumeric: 'tabular-nums', color: '#F8FAFC' }}>
                    {c.totalBookings}
                  </td>

                  <td style={{ padding: '0.95rem 1.25rem', fontWeight: 600, color: 'var(--accent-green)', fontVariantNumeric: 'tabular-nums', fontSize: '0.88rem' }}>
                    {c.totalSpend}
                  </td>

                  <td style={{ padding: '0.95rem 1.25rem', fontWeight: 600, color: 'var(--accent-cyan)', fontVariantNumeric: 'tabular-nums', fontSize: '0.88rem' }}>
                    {c.walletBalance}
                  </td>

                  <td style={{ padding: '0.95rem 1.25rem' }}>
                    <StatusBadge status={c.status} />
                  </td>

                  <td style={{ padding: '0.95rem 1.25rem' }}>
                    <button
                      onClick={() => setSelectedCustomer(c)}
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
                      Dossier
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ─── CUSTOMER DOSSIER MODAL ─── */}
      {selectedCustomer && (
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
            maxWidth: '560px',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Customer Dossier
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#F8FAFC', marginTop: '0.2rem' }}>{selectedCustomer.name}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                  ID: {selectedCustomer.id} · Rating {selectedCustomer?.rating ?? selectedCustomer?.ratingGiven ?? '—'} / 5.0
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Quick Actions & Membership Upgrade */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Subscription Tier Adjustment
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['Basic', 'Pro', 'Elite'] as const).map(tier => (
                  <button
                    key={tier}
                    onClick={() => handleUpgradeTier(selectedCustomer.id, tier)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: selectedCustomer.membershipTier === tier ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                      background: selectedCustomer.membershipTier === tier ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.02)',
                      color: selectedCustomer.membershipTier === tier ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Adjustment Control */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Issue Courtesy Wallet Credit
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[250, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleIssueWalletCredit(selectedCustomer.id, amt)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(16,185,129,0.3)',
                      background: 'var(--accent-green-subtle)',
                      color: 'var(--accent-green)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    +₹{amt}.00
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              style={{
                width: '100%',
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
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
