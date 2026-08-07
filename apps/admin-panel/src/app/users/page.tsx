'use client';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { users } from '@/lib/mock-data';

export default function UsersPage() {
  const tableData = users.map(u => ({
    Name: u.name,
    Phone: u.phone,
    Email: u.email,
    Membership: u.membership,
    Balance: `₹${u.balance}`,
    Status: <StatusBadge status={u.status} />,
    Actions: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button style={{ color: 'var(--accent-cyan)' }}>View</button>
        <button style={{ color: 'var(--danger)' }}>Suspend</button>
      </div>
    )
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>User Management</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input type="text" placeholder="Search users..." />
          <select>
            <option>All Statuses</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </div>
      </div>
      <DataTable columns={['Name', 'Phone', 'Email', 'Membership', 'Balance', 'Status', 'Actions']} data={tableData} />
    </div>
  );
}
