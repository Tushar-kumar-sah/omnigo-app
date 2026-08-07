export const currentUser = {
  id: 'u1',
  name: 'Alex Mercer',
  phone: '+1 555-0123',
  walletBalance: 4500,
  verified: true,
};

export const vehicleTypes = [
  { id: 'v1', name: 'Standard Tow', icon: 'car-outline', price: 1500 },
  { id: 'v2', name: 'Flatbed', icon: 'bus-outline', price: 2500 },
  { id: 'v3', name: 'Heavy Duty', icon: 'train-outline', price: 4000 },
];

export const bookings = [
  { id: 'b1', date: '2026-08-01', type: 'Flatbed', pickup: 'Downtown 5th Ave', drop: 'Auto Shop North', status: 'Completed', price: 2500 },
  { id: 'b2', date: '2026-07-28', type: 'Standard Tow', pickup: 'Highway 61', drop: 'Home', status: 'Cancelled', price: 1500 },
];

export const walletTransactions = [
  { id: 't1', date: '2026-08-01', amount: -2500, title: 'Tow Service - Flatbed', type: 'debit' },
  { id: 't2', date: '2026-07-25', amount: 5000, title: 'Wallet Topup', type: 'credit' },
];

export const drivers = [
  { id: 'd1', name: 'Jake Vance', rating: 4.8, distance: '2.5 km', eta: '5 mins', vehicle: 'Flatbed - NY 4242' },
];
