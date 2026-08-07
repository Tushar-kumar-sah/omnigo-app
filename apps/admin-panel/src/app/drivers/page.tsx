'use client';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { drivers } from '@/lib/mock-data';

export default function DriversPage() {
  const tableData = drivers.map(d => ({
    Name: d.name,
    Phone: d.phone,
    Vehicle: d.vehicle,
    Rating: `${d.rating} ⭐`,
    Status: <StatusBadge status={d.status} />,
    Trips: d.trips,
    Earnings: `₹${d.earnings.toLocaleString()}`,
    Actions: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button style={{ color: 'var(--accent-cyan)' }}>View</button>
        <button style={{ color: 'var(--accent-green)' }}>Verify</button>
      </div>
    )
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Driver Management</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input type="text" placeholder="Search drivers..." />
          <select>
            <option>All Statuses</option>
            <option>Online</option>
            <option>Offline</option>
          </select>
        </div>
      </div>
      <DataTable columns={['Name', 'Phone', 'Vehicle', 'Rating', 'Status', 'Trips', 'Earnings', 'Actions']} data={tableData} />
    </div>
  );
}
