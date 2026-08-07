'use client';
import StatsCard from '@/components/StatsCard';
import GlassCard from '@/components/GlassCard';
import { revenueData } from '@/lib/mock-data';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenuePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Revenue & Payments</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <StatsCard title="Total Revenue (YTD)" value="₹12,50,000" trend="+15%" />
        <StatsCard title="Total Commissions" value="₹2,50,000" trend="+12%" />
        <StatsCard title="Driver Payouts" value="₹10,00,000" />
      </div>

      <GlassCard>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Revenue Trend</h3>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--accent-cyan)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
