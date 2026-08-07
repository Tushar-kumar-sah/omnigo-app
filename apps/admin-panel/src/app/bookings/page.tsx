'use client';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { bookings } from '@/lib/mock-data';

export default function BookingsPage() {
  const tableData = bookings.map(b => ({
    ID: b.id,
    Customer: b.customer,
    Driver: b.driver,
    Vehicle: b.vehicle,
    Pickup: b.pickup,
    Drop: b.drop,
    Status: <StatusBadge status={b.status} />,
    Price: `₹${b.price}`,
    Date: b.date
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Booking Management</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input type="text" placeholder="Search ID..." />
          <input type="date" />
          <select>
            <option>All Statuses</option>
            <option>Completed</option>
            <option>Searching</option>
          </select>
        </div>
      </div>
      <DataTable columns={['ID', 'Customer', 'Driver', 'Vehicle', 'Pickup', 'Drop', 'Status', 'Price', 'Date']} data={tableData} />
    </div>
  );
}
