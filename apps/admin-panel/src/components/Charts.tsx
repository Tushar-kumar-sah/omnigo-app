'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface RevenueChartProps {
  data: Array<{ name: string; revenue: number; bookings: number }>;
}

export function RevenueLineChart({ data }: RevenueChartProps) {
  return (
    <div style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="var(--text-secondary)" />
          <YAxis stroke="var(--text-secondary)" />
          <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
          <Line type="monotone" dataKey="revenue" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ fill: 'var(--accent-cyan)', r: 4 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BookingsBarChart({ data }: RevenueChartProps) {
  return (
    <div style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="var(--text-secondary)" />
          <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
          <Bar dataKey="bookings" fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueFullChart({ data }: RevenueChartProps) {
  return (
    <div style={{ height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="var(--text-secondary)" />
          <YAxis stroke="var(--text-secondary)" />
          <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }} />
          <Line type="monotone" dataKey="revenue" stroke="var(--accent-cyan)" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
