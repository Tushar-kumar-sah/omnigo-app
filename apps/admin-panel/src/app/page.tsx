'use client';
import StatsCard from '@/components/StatsCard';
import GlassCard from '@/components/GlassCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { adminStats, bookings, revenueData } from '@/lib/mock-data';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Dashboard() {
  const recentBookings = bookings.map(b => ({
    ID: b.id,
    Customer: b.customer,
    Driver: b.driver,
    Status: <StatusBadge status={b.status} />,
    Price: `₹${b.price}`
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Dashboard Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <StatsCard title="Total Users" value={adminStats.totalUsers.toLocaleString()} trend="+12% from last month" />
        <StatsCard title="Total Drivers" value={adminStats.totalDrivers.toLocaleString()} trend="+5% from last month" />
        <StatsCard title="Total Bookings" value={adminStats.totalBookings.toLocaleString()} trend="+24% from last month" />
        <StatsCard title="Today's Revenue" value={`₹${adminStats.todaysRevenue.toLocaleString()}`} trend="+8% from yesterday" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <GlassCard>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Revenue Trend (Last 7 Days)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="revenue" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ fill: 'var(--accent-cyan)', r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Bookings</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                <Bar dataKey="bookings" fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Recent Bookings</h3>
        <DataTable columns={['ID', 'Customer', 'Driver', 'Status', 'Price']} data={recentBookings} />
      </div>
    </div>
  );
}
