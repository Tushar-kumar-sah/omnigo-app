'use client';
import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { bookings } from '@/lib/mock-data';

export default function BookingsPage() {
  const [filter, setFilter] = useState<'all' | 'Completed' | 'Searching'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const filteredBookings = bookings.filter(b => {
    const matches = b.id.toLowerCase().includes(searchTerm.toLowerCase()) || b.customer.toLowerCase().includes(searchTerm.toLowerCase()) || b.driver.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matches) return false;
    if (filter !== 'all' && b.status !== filter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Bookings & Trip Records
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Live & historical towing orders, route logs, financial captures, and trip details
          </p>
        </div>

        {/* Search & Status Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search booking ID, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '220px' }}
          />

          <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.02)', padding: '3px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            {['all', 'Completed', 'Searching'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab as any)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: filter === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: filter === tab ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Booking ID</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Assigned Driver</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Vehicle</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Route</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Fare</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr
                  key={b.id}
                  style={{ borderBottom: '1px solid var(--glass-border-subtle)', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '0.95rem 1.25rem', fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '0.84rem' }}>{b.id}</td>
                  <td style={{ padding: '0.95rem 1.25rem', fontWeight: 600, fontSize: '0.88rem', color: '#F8FAFC' }}>{b.customer}</td>
                  <td style={{ padding: '0.95rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{b.driver}</td>
                  <td style={{ padding: '0.95rem 1.25rem', fontSize: '0.82rem', color: '#E2E8F0' }}>{b.vehicle}</td>
                  <td style={{ padding: '0.95rem 1.25rem', fontSize: '0.78rem' }}>
                    <div style={{ color: '#F8FAFC' }}>{b.pickup}</div>
                    <div style={{ color: 'var(--text-muted)' }}>➔ {b.drop}</div>
                  </td>
                  <td style={{ padding: '0.95rem 1.25rem' }}><StatusBadge status={b.status} /></td>
                  <td style={{ padding: '0.95rem 1.25rem', fontWeight: 600, color: 'var(--accent-green)', fontVariantNumeric: 'tabular-nums', fontSize: '0.88rem' }}>₹{b.price}.00</td>
                  <td style={{ padding: '0.95rem 1.25rem' }}>
                    <button
                      onClick={() => setSelectedBooking(b)}
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
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Booking Details Modal */}
      {selectedBooking && (
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
            maxWidth: '520px',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Booking Archive Dossier
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#F8FAFC', marginTop: '0.2rem' }}>{selectedBooking.id}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{selectedBooking.customer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Driver:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{selectedBooking.driver}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle Model:</span>
                <span>{selectedBooking.vehicle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pickup:</span>
                <span style={{ color: '#E2E8F0' }}>{selectedBooking.pickup}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dropoff:</span>
                <span style={{ color: '#E2E8F0' }}>{selectedBooking.drop}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>₹{selectedBooking.price}.00</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
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
