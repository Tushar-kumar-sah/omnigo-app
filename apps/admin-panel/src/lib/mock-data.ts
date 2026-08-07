export const adminStats = {
  totalUsers: 15420,
  totalDrivers: 892,
  totalBookings: 48750,
  todaysRevenue: 45200,
  activeDrivers: 324
};

export const revenueData = [
  { name: 'Mon', revenue: 40000, bookings: 240 },
  { name: 'Tue', revenue: 30000, bookings: 139 },
  { name: 'Wed', revenue: 20000, bookings: 980 },
  { name: 'Thu', revenue: 27800, bookings: 390 },
  { name: 'Fri', revenue: 18900, bookings: 480 },
  { name: 'Sat', revenue: 23900, bookings: 380 },
  { name: 'Sun', revenue: 34900, bookings: 430 },
];

export const users = [
  { id: '1', name: 'John Doe', phone: '+91 9876543210', email: 'john@example.com', membership: 'Gold', balance: 500, status: 'Active' },
  { id: '2', name: 'Jane Smith', phone: '+91 9876543211', email: 'jane@example.com', membership: 'Basic', balance: 100, status: 'Suspended' },
];

export const drivers = [
  { id: '1', name: 'Ramesh Singh', phone: '+91 9876543212', vehicle: 'Flatbed', rating: 4.8, status: 'Online', trips: 450, earnings: 150000 },
  { id: '2', name: 'Suresh Kumar', phone: '+91 9876543213', vehicle: 'Wheel-Lift', rating: 4.5, status: 'Offline', trips: 320, earnings: 95000 },
];

export const bookings = [
  { id: 'B-1001', customer: 'John Doe', driver: 'Ramesh Singh', vehicle: 'Sedan', pickup: 'Mumbai', drop: 'Pune', status: 'Completed', price: 4500, date: '2026-08-07' },
  { id: 'B-1002', customer: 'Jane Smith', driver: 'Pending', vehicle: 'SUV', pickup: 'Delhi', drop: 'Gurgaon', status: 'Searching', price: 2000, date: '2026-08-08' },
];
