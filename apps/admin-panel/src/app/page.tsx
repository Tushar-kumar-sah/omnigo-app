'use client';
import React from 'react';
import StatsCard from '@/components/StatsCard';
import GlassCard from '@/components/GlassCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { adminStats, revenueData, hourlyActivityData, dispatchQueue } from '@/lib/mock-data';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from '@/components/Charts';
import Link from 'next/link';

export default function Dashboard() {
  const recentBookings = [
    {
      ID: 'JOB-7821',
      Customer: 'Rahul Sharma',
      Vehicle: 'Honda City (Sedan)',
      Pickup: 'MG Road, Bangalore',
      Status: <StatusBadge status="Completed" />,
      Price: '₹850.00',
    },
    {
      ID: 'JOB-7830',
      Customer: 'Rohit Kulkarni',
      Vehicle: 'Hyundai Creta (SUV)',
      Pickup: 'Koramangala 4th Block',
      Status: <StatusBadge status="Searching" />,
      Price: '₹950.00',
    },
    {
      ID: 'SOS-991',
      Customer: 'Ananya Sharma',
      Vehicle: 'Honda City (Fire Alert)',
      Pickup: 'E-City Flyover (Pillar 142)',
      Status: <StatusBadge status="High" />,
      Price: '₹1,850.00',
    },
    {
      ID: 'JOB-7802',
      Customer: 'Priya Sharma',
      Vehicle: 'Toyota Fortuner',
      Pickup: 'Pimpri, Pune',
      Status: <StatusBadge status="Completed" />,
      Price: '₹1,200.00',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Executive Dashboard
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Real-time fleet operations, dispatch queue, and financial ledger status
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
              Dispatch Queue ({dispatchQueue.length})
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
              Active SOS (1)
            </button>
          </Link>
        </div>
      </div>

      {/* 9 MUST-HAVE OPERATIONAL KPI CARDS */}
      <div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.85rem',
        }}>
          Operational Telemetry & Performance
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '1rem' }}>
          <StatsCard title="Today's Bookings" value={adminStats.todaysBookings.toString()} trend="+14% vs avg" />
          <StatsCard title="Active Bookings" value={adminStats.activeBookings.toString()} trend="18 In-Transit" />
          <StatsCard title="Completed" value={adminStats.completedBookings.toString()} trend="96% Success" />
          <StatsCard title="Cancelled" value={adminStats.cancelledBookings.toString()} trend="4.2% Rate" />
          <StatsCard title="Gross GMV" value={`₹${adminStats.gmv.toLocaleString('en-IN')}`} trend="+18% Vol" />
          <StatsCard title="OmniGo Revenue" value={`₹${adminStats.omniGoRevenue.toLocaleString('en-IN')}`} trend="15% Net Take" />
          <StatsCard title="Drivers Online" value={adminStats.driversOnline.toString()} trend="94% Active" />
          <StatsCard title="Available Trucks" value={adminStats.availableTrucks.toString()} trend="Ready for dispatch" />
          <StatsCard title="Average ETA" value={adminStats.averageEta} trend="-1.2 min faster" />
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
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Hourly fleet utilization & matching density</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>Live 24h</span>
          </div>

          <div style={{ height: '270px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyActivityData}>
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
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-green)' }}>+16.4%</span>
          </div>

          <div style={{ height: '270px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
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
                <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'var(--accent-green)' }} /> Available Trucks
              </span>
              <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>89 Units</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'var(--accent-cyan)' }} /> En-Route to Pickup
              </span>
              <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>12 Units</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
              <span style={{ color: 'var(--accent-purple)', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'var(--accent-purple)' }} /> Towing in Transit
              </span>
              <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>6 Units</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(244,63,94,0.06)', borderRadius: '6px', border: '1px solid rgba(244,63,94,0.2)' }}>
              <span style={{ color: 'var(--accent-red)', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'var(--accent-red)' }} /> Emergency Alerts
              </span>
              <span style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: '0.85rem' }}>1 Active</span>
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
          <DataTable columns={['ID', 'Customer', 'Vehicle', 'Pickup', 'Status', 'Fare']} data={recentBookings} />
        </div>
      </div>
    </div>
  );
}
