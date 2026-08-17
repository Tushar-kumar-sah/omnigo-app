'use client';
import React, { useState, useEffect } from 'react';
import StatsCard from '@/components/StatsCard';
import GlassCard from '@/components/GlassCard';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from '@/components/Charts';
import { getAllLedgerEntries, getBookings } from '@omnigo/api';

const COLORS = ['#38BDF8', '#10B981', '#F59E0B', '#F43F5E', '#A855F7'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [aovData, setAovData] = useState<any[]>([]);
  const [serviceData, setServiceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('API error');
        const { stats: sData, revenue: rData } = await res.json();
        if (sData) setStats(sData);
        if (rData && rData.length > 0) setRevenueData(rData);

        const ledger = await getAllLedgerEntries();
        if (ledger) {
          const aggregated = ledger.reduce((acc: any, entry: any) => {
             const date = new Date(entry.created_at || entry.date || new Date()).toLocaleDateString();
             if (!acc[date]) acc[date] = { total: 0, count: 0 };
             acc[date].total += Number(entry.amount || 0);
             acc[date].count += 1;
             return acc;
          }, {});
          const aovArr = Object.keys(aggregated).map(date => ({
             month: date,
             aov: Math.round(aggregated[date].total / aggregated[date].count),
             repeatRate: Math.round(Math.random() * 20 + 30) // placeholder for now
          }));
          setAovData(aovArr);
        }

        const bookings = await getBookings();
        if (bookings) {
          const sAgg = bookings.reduce((acc: any, b: any) => {
             const vt = b.vehicle_type || 'Unknown';
             acc[vt] = (acc[vt] || 0) + 1;
             return acc;
          }, {});
          const sArr = Object.keys(sAgg).map(vt => ({
             service: vt,
             trips: sAgg[vt]
          }));
          setServiceData(sArr);
        }
      } catch(e) { console.error('[Analytics]', e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Analytics & Cohort Insights
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Multi-timeframe demand curves, AOV velocity, geographical surge hotspots, and cancellation friction
          </p>
        </div>

        {/* Timeframe Selector */}
        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.02)', padding: '3px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          {(['daily', 'weekly', 'monthly'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: timeRange === range ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: timeRange === range ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatsCard title="Average Order Value (AOV)" value={stats?.totalBookings ? `₹${Math.round((stats.totalRevenue || stats.gmv || 0) / stats.totalBookings).toLocaleString('en-IN')}` : '₹0'} trend="Live AOV" />
        <StatsCard title="Platform Completion Rate" value={stats?.totalBookings ? `${Math.round(((stats.completedBookings || 0) / stats.totalBookings) * 100)}%` : '0%'} trend="Live Fulfillment" />
        <StatsCard title="Driver Fleet Active" value={stats?.driversOnline?.toString() || '0'} trend="Units Online" />
        <StatsCard title="Platform Cancellation Rate" value={stats?.totalBookings ? `${Math.round(((stats.cancelledBookings || 0) / stats.totalBookings) * 100)}%` : '0%'} trend="Live Rate" />
      </div>

      {/* Charts Row 1: GMV & Revenue vs Bookings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Gross GMV vs Net Commission Yield</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Platform escrow capture performance</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-green)' }}>Platform Yield</span>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="gmv" stroke="var(--accent-cyan)" fill="rgba(56,189,248,0.12)" name="Gross GMV (₹)" strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent-green)" fill="rgba(16,185,129,0.08)" name="Net Commission (₹)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>AOV & Retention Cohort</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Average ticket growth</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>Active Cohort</span>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Loading AOV Cohort...
                </div>
              ) : (
                <LineChart data={aovData}>
                  <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="aov" stroke="var(--accent-yellow)" strokeWidth={2.5} name="AOV (₹)" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="repeatRate" stroke="var(--accent-green)" strokeWidth={2.5} name="Repeat %" dot={{ r: 3 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 2: Most Requested Services & Peak Locations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Most Requested Services Bar Chart */}
        <GlassCard>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Service Class Demand Distribution</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Total completed requests by vehicle category</p>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Loading service demand...
                </div>
              ) : (
                <BarChart data={serviceData}>
                  <XAxis dataKey="service" stroke="#475569" fontSize={12} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="trips" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} name="Completed Trips" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Peak Demand Hotspots */}
        <GlassCard>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Peak Geographic Hotspots</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>High request density corridors requiring fleet positioning</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[]}
          </div>
        </GlassCard>
      </div>

      {/* Cancellation Cause Breakdown */}
      <GlassCard>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Cancellation Cause Diagnostics</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Root causes for customer and driver trip aborts</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[]}
        </div>
      </GlassCard>
    </div>
  );
}
