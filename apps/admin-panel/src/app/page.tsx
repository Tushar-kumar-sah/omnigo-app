'use client';
import React from 'react';
import StatsCard from '@/components/StatsCard';
import GlassCard from '@/components/GlassCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from '@/components/Charts';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = React.useState({ todaysBookings: 0, activeBookings: 0, completedBookings: 0, cancelledBookings: 0, gmv: 0, omniGoRevenue: 0, driversOnline: 0, availableTrucks: 0, averageEta: '—', totalUsers: 0, totalDrivers: 0, totalBookings: 0, totalRevenue: 0 });
  const [revData, setRevData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeSOSCount, setActiveSOSCount] = React.useState(0);
  const [pendingDispatch, setPendingDispatch] = React.useState(0);
  const [recentBookings, setRecentBookings] = React.useState<any[]>([]);
  // removed hardcoded mock data

  React.useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);

        // Fetch stats + revenue via API route (server-side DB)
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const { stats: liveStats, revenue: liveRev } = await statsRes.json();
          if (liveStats) setStats(liveStats);
          if (liveRev && liveRev.length > 0) setRevData(liveRev);
        }

        // Fetch bookings for live dispatch feed
        const bookingsRes = await fetch('/api/bookings');
        if (bookingsRes.ok) {
          const { bookings: liveBooks } = await bookingsRes.json();
          if (liveBooks && liveBooks.length > 0) {
            const mapped = liveBooks.slice(0, 5).map((b: any) => ({
              ID: b.id || b.booking_number || 'N/A',
              Customer: b.customer || b.customerName || 'Unknown',
              Vehicle: b.vehicle || b.vehicleType || 'Vehicle',
              Pickup: b.pickup || b.pickup_address || '—',
              Status: <StatusBadge status={b.status} />,
              Fare: `₹${Number(b.price || b.estimated_price || 0).toLocaleString('en-IN')}`,
            }));
            setRecentBookings(mapped);
          }
        }

        // Fetch dispatch/sos counts
        const dispatchRes = await fetch('/api/dispatch');
        if (dispatchRes.ok) {
          const { queue } = await dispatchRes.json();
          if (queue) setPendingDispatch(queue.length);
        }

        const sosRes = await fetch('/api/sos');
        if (sosRes.ok) {
          const { incidents } = await sosRes.json();
          if (incidents) {
            setActiveSOSCount(incidents.filter((i: any) =>
              i.status === 'active' || (i.status || '').toLowerCase().includes('active')
            ).length);
          }
        }
      } catch (e) {
        console.error('[Dashboard] fetch error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
    // Auto-refresh every 30s
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Executive Dashboard
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Real-time fleet operations, dispatch queue, and financial ledger status
            {loading && (
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '4px', color: 'var(--accent-cyan)' }}>
                Fetching live data...
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/dispatch">
            <button style={{
              padding: '0.6rem 1.15rem',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              Dispatch Queue ({pendingDispatch})
            </button>
          </Link>
          <Link href="/sos">
            <button style={{
              padding: '0.6rem 1.15rem',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-red)',
              fontWeight: 600,
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              Active SOS ({activeSOSCount})
            </button>
          </Link>
        </div>
      </div>

      {/* 9 OPERATIONAL KPI CARDS */}
      <div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.85rem',
        }}>
          Operational Telemetry &amp; Performance
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '1rem' }}>
          <StatsCard title="Today's Bookings" value={(stats?.todaysBookings ?? 0).toString()} trend="Today" />
          <StatsCard title="Active Bookings" value={(stats?.activeBookings ?? 0).toString()} trend="In-Transit" />
          <StatsCard title="Completed" value={(stats?.completedBookings ?? 0).toString()} trend="Fulfilled" />
          <StatsCard title="Cancelled" value={(stats?.cancelledBookings ?? 0).toString()} trend="Aborted" />
          <StatsCard title="Gross GMV" value={`₹${(stats?.gmv ?? 0).toLocaleString('en-IN')}`} trend="Platform Gross" />
          <StatsCard title="OmniGo Revenue" value={`₹${(stats?.omniGoRevenue ?? 0).toLocaleString('en-IN')}`} trend="Net Commission" />
          <StatsCard title="Drivers Online" value={(stats?.driversOnline ?? 0).toString()} trend="Active Units" />
          <StatsCard title="Available Trucks" value={(stats?.availableTrucks ?? 0).toString()} trend="Ready for dispatch" />
          <StatsCard title="Average ETA" value={stats?.averageEta ?? '—'} trend="Dispatch ETA" />
        </div>
      </div>

      {/* Real-Time Operational Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>
                Request Demand vs Driver Supply
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Hourly fleet utilization &amp; matching density</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>Live 24h</span>
          </div>

          <div style={{ height: '270px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[]}>
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="requests" stroke="var(--accent-cyan)" fill="rgba(56,189,248,0.12)" name="Trip Requests" strokeWidth={2} />
                <Area type="monotone" dataKey="drivers" stroke="var(--accent-green)" fill="rgba(16,185,129,0.08)" name="Available Drivers" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>
                Weekly Revenue
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Platform commission yield</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-green)' }}>Live Feed</span>
          </div>

          <div style={{ height: '270px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="revenue" fill="var(--accent-green)" radius={[4, 4, 0, 0]} name="Net Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Live Fleet Status & Recent Operational Bookings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Fleet Distribution */}
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Fleet State Distribution</h3>
            <Link href="/fleet" style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 600 }}>
              Fleet Map ➔
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
              <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'var(--accent-green)', flexShrink: 0 }} /> Available Trucks
              </span>
              <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>{stats?.availableTrucks ?? 0} Units</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'var(--accent-cyan)', flexShrink: 0 }} /> En-Route to Pickup
              </span>
              <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>{stats?.activeBookings ?? 0} Units</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
              <span style={{ color: 'var(--accent-purple)', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'var(--accent-purple)', flexShrink: 0 }} /> Towing in Transit
              </span>
              <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>{stats?.activeBookings ?? 0} Units</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(244,63,94,0.06)', borderRadius: '6px', border: '1px solid rgba(244,63,94,0.2)' }}>
              <span style={{ color: 'var(--accent-red)', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'var(--accent-red)', flexShrink: 0 }} /> Emergency Alerts
              </span>
              <span style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: '0.85rem' }}>{activeSOSCount} Active</span>
            </div>
          </div>
        </GlassCard>

        {/* Recent Operational Bookings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Live Dispatch Feed</h3>
            <Link href="/bookings" style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 600 }}>
              All Bookings ➔
            </Link>
          </div>
          {/* Columns MUST match keys in recentBookings objects exactly */}
          <DataTable columns={['ID', 'Customer', 'Vehicle', 'Pickup', 'Status', 'Fare']} data={recentBookings} />
        </div>
      </div>
    </div>
  );
}
