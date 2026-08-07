/**
 * OmniGo Mock Data — Comprehensive dummy data for all 3 apps
 */
import type {
  User, Driver, VehicleType, Booking, WalletTransaction,
  Notification, MembershipTier, ChatMessage, AdminStats,
  RevenueDataPoint, DriverEarnings,
} from './types';

// ─── Vehicle Types ──────────────────────────────────────────
export const vehicleTypes: VehicleType[] = [
  {
    id: 'bike',
    name: 'Bike',
    description: 'Two-wheeler towing',
    icon: 'bicycle',
    basePrice: 199,
    pricePerKm: 15,
    image: 'bike',
  },
  {
    id: 'sedan',
    name: 'Sedan',
    description: 'Standard car towing',
    icon: 'car-sport',
    basePrice: 499,
    pricePerKm: 25,
    image: 'sedan',
  },
  {
    id: 'suv',
    name: 'SUV',
    description: 'SUV & large vehicle towing',
    icon: 'car',
    basePrice: 799,
    pricePerKm: 35,
    image: 'suv',
  },
  {
    id: 'truck',
    name: 'Truck',
    description: 'Heavy vehicle towing',
    icon: 'bus',
    basePrice: 1499,
    pricePerKm: 50,
    image: 'truck',
  },
];

// ─── Current User (logged-in) ──────────────────────────────
export const currentUser: User = {
  id: 'u1',
  name: 'Rahul Sharma',
  phone: '+91 98765 43210',
  email: 'rahul@example.com',
  avatar: '',
  isVerified: true,
  membershipTier: 'gold',
  walletBalance: 4500,
  createdAt: '2025-01-15',
};

// ─── Users ──────────────────────────────────────────────────
export const users: User[] = [
  currentUser,
  { id: 'u2', name: 'Priya Patel', phone: '+91 98765 43211', email: 'priya@example.com', avatar: '', isVerified: true, membershipTier: 'silver', walletBalance: 2200, createdAt: '2025-02-20' },
  { id: 'u3', name: 'Amit Kumar', phone: '+91 98765 43212', email: 'amit@example.com', avatar: '', isVerified: true, membershipTier: 'platinum', walletBalance: 8900, createdAt: '2025-03-10' },
  { id: 'u4', name: 'Sneha Reddy', phone: '+91 98765 43213', email: 'sneha@example.com', avatar: '', isVerified: false, membershipTier: 'none', walletBalance: 500, createdAt: '2025-04-05' },
  { id: 'u5', name: 'Vikram Singh', phone: '+91 98765 43214', email: 'vikram@example.com', avatar: '', isVerified: true, membershipTier: 'gold', walletBalance: 3100, createdAt: '2025-05-12' },
  { id: 'u6', name: 'Ananya Gupta', phone: '+91 98765 43215', email: 'ananya@example.com', avatar: '', isVerified: true, membershipTier: 'none', walletBalance: 1500, createdAt: '2025-06-01' },
  { id: 'u7', name: 'Rohan Joshi', phone: '+91 98765 43216', email: 'rohan@example.com', avatar: '', isVerified: true, membershipTier: 'silver', walletBalance: 750, createdAt: '2025-06-20' },
  { id: 'u8', name: 'Meera Nair', phone: '+91 98765 43217', email: 'meera@example.com', avatar: '', isVerified: false, membershipTier: 'none', walletBalance: 0, createdAt: '2025-07-15' },
  { id: 'u9', name: 'Karan Malhotra', phone: '+91 98765 43218', email: 'karan@example.com', avatar: '', isVerified: true, membershipTier: 'gold', walletBalance: 6200, createdAt: '2025-08-02' },
  { id: 'u10', name: 'Divya Iyer', phone: '+91 98765 43219', email: 'divya@example.com', avatar: '', isVerified: true, membershipTier: 'platinum', walletBalance: 12000, createdAt: '2025-09-10' },
];

// ─── Drivers ────────────────────────────────────────────────
const defaultEarnings: DriverEarnings = { today: 1250, thisWeek: 8500, thisMonth: 32000, total: 285000 };

export const drivers: Driver[] = [
  { id: 'd1', name: 'Vikram Towing', phone: '+91 99876 54321', email: 'vikram.t@example.com', avatar: '', rating: 4.9, totalTrips: 1284, isOnline: true, isVerified: true, vehicleType: 'Flatbed Truck', vehicleNumber: 'MH 01 AB 1234', licensePlate: 'MH01AB1234', location: { latitude: 19.076, longitude: 72.8777 }, earnings: { ...defaultEarnings, today: 2100 }, createdAt: '2024-06-15' },
  { id: 'd2', name: 'Rajesh Kumar', phone: '+91 99876 54322', email: 'rajesh@example.com', avatar: '', rating: 4.7, totalTrips: 856, isOnline: true, isVerified: true, vehicleType: 'Wheel Lift', vehicleNumber: 'MH 02 CD 5678', licensePlate: 'MH02CD5678', location: { latitude: 19.082, longitude: 72.882 }, earnings: { ...defaultEarnings, today: 1800 }, createdAt: '2024-08-20' },
  { id: 'd3', name: 'Suresh Patil', phone: '+91 99876 54323', email: 'suresh@example.com', avatar: '', rating: 4.8, totalTrips: 1102, isOnline: false, isVerified: true, vehicleType: 'Flatbed Truck', vehicleNumber: 'MH 03 EF 9012', licensePlate: 'MH03EF9012', location: { latitude: 19.070, longitude: 72.870 }, earnings: defaultEarnings, createdAt: '2024-09-10' },
  { id: 'd4', name: 'Manoj Verma', phone: '+91 99876 54324', email: 'manoj@example.com', avatar: '', rating: 4.5, totalTrips: 643, isOnline: true, isVerified: true, vehicleType: 'Integrated Tow', vehicleNumber: 'DL 04 GH 3456', licensePlate: 'DL04GH3456', location: { latitude: 28.644, longitude: 77.216 }, earnings: { ...defaultEarnings, today: 950 }, createdAt: '2024-10-05' },
  { id: 'd5', name: 'Anil Sharma', phone: '+91 99876 54325', email: 'anil@example.com', avatar: '', rating: 4.6, totalTrips: 789, isOnline: true, isVerified: true, vehicleType: 'Flatbed Truck', vehicleNumber: 'KA 05 IJ 7890', licensePlate: 'KA05IJ7890', location: { latitude: 12.971, longitude: 77.594 }, earnings: { ...defaultEarnings, today: 1500 }, createdAt: '2024-11-15' },
  { id: 'd6', name: 'Deepak Yadav', phone: '+91 99876 54326', email: 'deepak@example.com', avatar: '', rating: 4.3, totalTrips: 421, isOnline: false, isVerified: true, vehicleType: 'Wheel Lift', vehicleNumber: 'TN 06 KL 2345', licensePlate: 'TN06KL2345', location: { latitude: 13.082, longitude: 80.270 }, earnings: { ...defaultEarnings, today: 600 }, createdAt: '2025-01-20' },
  { id: 'd7', name: 'Prakash Naik', phone: '+91 99876 54327', email: 'prakash@example.com', avatar: '', rating: 4.8, totalTrips: 978, isOnline: true, isVerified: true, vehicleType: 'Flatbed Truck', vehicleNumber: 'MH 07 MN 6789', licensePlate: 'MH07MN6789', location: { latitude: 19.090, longitude: 72.890 }, earnings: { ...defaultEarnings, today: 1900 }, createdAt: '2025-02-10' },
  { id: 'd8', name: 'Santosh Gowda', phone: '+91 99876 54328', email: 'santosh@example.com', avatar: '', rating: 4.4, totalTrips: 532, isOnline: true, isVerified: false, vehicleType: 'Integrated Tow', vehicleNumber: 'KA 08 OP 0123', licensePlate: 'KA08OP0123', location: { latitude: 12.965, longitude: 77.600 }, earnings: { ...defaultEarnings, today: 750 }, createdAt: '2025-03-05' },
  { id: 'd9', name: 'Ramesh Bhat', phone: '+91 99876 54329', email: 'ramesh@example.com', avatar: '', rating: 4.9, totalTrips: 1567, isOnline: true, isVerified: true, vehicleType: 'Heavy Duty', vehicleNumber: 'MH 09 QR 4567', licensePlate: 'MH09QR4567', location: { latitude: 19.100, longitude: 72.895 }, earnings: { ...defaultEarnings, today: 2800 }, createdAt: '2024-05-01' },
  { id: 'd10', name: 'Kiran Desai', phone: '+91 99876 54330', email: 'kiran@example.com', avatar: '', rating: 4.2, totalTrips: 312, isOnline: false, isVerified: true, vehicleType: 'Wheel Lift', vehicleNumber: 'GJ 10 ST 8901', licensePlate: 'GJ10ST8901', location: { latitude: 23.022, longitude: 72.571 }, earnings: { ...defaultEarnings, today: 0 }, createdAt: '2025-05-20' },
];

// ─── Bookings ───────────────────────────────────────────────
export const bookings: Booking[] = [
  { id: 'b1', userId: 'u1', driverId: 'd1', vehicleTypeId: 'sedan', customerVehicle: { number: 'MH 01 XY 1234', brand: 'Honda', model: 'City' }, pickup: { coordinates: { latitude: 19.076, longitude: 72.8777 }, address: 'Andheri West, Mumbai' }, dropoff: { coordinates: { latitude: 19.054, longitude: 72.840 }, address: 'Bandra West, Mumbai' }, status: 'completed', estimatedPrice: 1250, finalPrice: 1180, estimatedETA: 22, distance: 8.5, createdAt: '2026-08-07T14:30:00', completedAt: '2026-08-07T15:15:00', driverRating: 5, paymentMethod: 'upi', paymentStatus: 'completed' },
  { id: 'b2', userId: 'u1', driverId: 'd2', vehicleTypeId: 'suv', customerVehicle: { number: 'MH 01 AB 5678', brand: 'Toyota', model: 'Fortuner' }, pickup: { coordinates: { latitude: 19.082, longitude: 72.882 }, address: 'Powai, Mumbai' }, dropoff: { coordinates: { latitude: 19.120, longitude: 72.905 }, address: 'Thane West' }, status: 'completed', estimatedPrice: 2100, finalPrice: 2100, estimatedETA: 35, distance: 12.3, createdAt: '2026-08-05T10:00:00', completedAt: '2026-08-05T11:00:00', driverRating: 4, paymentMethod: 'card', paymentStatus: 'completed' },
  { id: 'b3', userId: 'u1', vehicleTypeId: 'bike', customerVehicle: { number: 'MH 01 CD 9012', brand: 'Royal Enfield', model: 'Classic 350' }, pickup: { coordinates: { latitude: 19.060, longitude: 72.860 }, address: 'Juhu, Mumbai' }, dropoff: { coordinates: { latitude: 19.040, longitude: 72.830 }, address: 'Santa Cruz, Mumbai' }, status: 'cancelled', estimatedPrice: 450, estimatedETA: 15, distance: 4.2, createdAt: '2026-08-03T18:45:00', paymentMethod: 'wallet', paymentStatus: 'refunded' },
  { id: 'b4', userId: 'u2', driverId: 'd3', vehicleTypeId: 'sedan', customerVehicle: { number: 'MH 02 EF 3456', brand: 'Hyundai', model: 'Creta' }, pickup: { coordinates: { latitude: 19.070, longitude: 72.870 }, address: 'Goregaon, Mumbai' }, dropoff: { coordinates: { latitude: 19.095, longitude: 72.850 }, address: 'Kandivali, Mumbai' }, status: 'completed', estimatedPrice: 890, finalPrice: 890, estimatedETA: 18, distance: 6.1, createdAt: '2026-08-06T09:20:00', completedAt: '2026-08-06T09:55:00', driverRating: 5, paymentMethod: 'upi', paymentStatus: 'completed' },
  { id: 'b5', userId: 'u3', driverId: 'd5', vehicleTypeId: 'truck', customerVehicle: { number: 'KA 03 GH 7890', brand: 'Tata', model: 'Ace' }, pickup: { coordinates: { latitude: 12.971, longitude: 77.594 }, address: 'MG Road, Bangalore' }, dropoff: { coordinates: { latitude: 12.935, longitude: 77.610 }, address: 'Koramangala, Bangalore' }, status: 'completed', estimatedPrice: 3200, finalPrice: 2880, estimatedETA: 28, distance: 7.8, createdAt: '2026-08-04T12:00:00', completedAt: '2026-08-04T12:45:00', driverRating: 5, paymentMethod: 'card', paymentStatus: 'completed' },
  { id: 'b6', userId: 'u5', driverId: 'd1', vehicleTypeId: 'sedan', customerVehicle: { number: 'MH 05 IJ 2345', brand: 'Maruti', model: 'Swift' }, pickup: { coordinates: { latitude: 19.050, longitude: 72.855 }, address: 'Versova, Mumbai' }, dropoff: { coordinates: { latitude: 19.035, longitude: 72.840 }, address: 'Lokhandwala, Mumbai' }, status: 'towing', estimatedPrice: 750, estimatedETA: 12, distance: 3.8, createdAt: '2026-08-07T16:30:00', paymentMethod: 'cash', paymentStatus: 'pending' },
  { id: 'b7', userId: 'u4', vehicleTypeId: 'bike', customerVehicle: { number: 'MH 04 KL 6789', brand: 'Honda', model: 'Activa' }, pickup: { coordinates: { latitude: 19.085, longitude: 72.878 }, address: 'Hiranandani, Mumbai' }, dropoff: { coordinates: { latitude: 19.100, longitude: 72.890 }, address: 'Vikhroli, Mumbai' }, status: 'searching', estimatedPrice: 350, estimatedETA: 10, distance: 2.5, createdAt: '2026-08-07T17:00:00', paymentMethod: 'upi', paymentStatus: 'pending' },
];

// ─── Wallet Transactions ────────────────────────────────────
export const walletTransactions: WalletTransaction[] = [
  { id: 'wt1', type: 'debit', amount: 1180, description: 'Booking #b1 - Honda City Tow', date: '2026-08-07', bookingId: 'b1' },
  { id: 'wt2', type: 'credit', amount: 500, description: 'Referral Bonus - Priya Patel', date: '2026-08-06' },
  { id: 'wt3', type: 'credit', amount: 2000, description: 'Wallet Recharge', date: '2026-08-05' },
  { id: 'wt4', type: 'debit', amount: 2100, description: 'Booking #b2 - Toyota Fortuner Tow', date: '2026-08-05', bookingId: 'b2' },
  { id: 'wt5', type: 'credit', amount: 450, description: 'Refund - Cancelled Booking #b3', date: '2026-08-03', bookingId: 'b3' },
  { id: 'wt6', type: 'credit', amount: 5000, description: 'Wallet Recharge', date: '2026-08-01' },
  { id: 'wt7', type: 'debit', amount: 650, description: 'Gold Membership Fee', date: '2026-07-28' },
];

// ─── Notifications ──────────────────────────────────────────
export const notifications: Notification[] = [
  { id: 'n1', title: 'Tow Completed!', message: 'Your Honda City has been safely delivered to Bandra West. Rate your experience!', type: 'booking', isRead: false, createdAt: '2026-08-07T15:15:00' },
  { id: 'n2', title: 'OmniBot', message: 'Your vehicle troubleshooting steps for basic car battery and starting problems. Check connections and try jump-starting.', type: 'ai', isRead: false, createdAt: '2026-08-07T14:00:00' },
  { id: 'n3', title: '🎉 Gold Member Reward', message: 'You\'ve earned a ₹200 reward card! Use it on your next booking.', type: 'promotion', isRead: true, createdAt: '2026-08-06T10:00:00' },
  { id: 'n4', title: 'Driver Arriving', message: 'Vikram Towing is 5 mins away from your pickup location.', type: 'booking', isRead: true, createdAt: '2026-08-07T14:35:00' },
  { id: 'n5', title: 'System Update', message: 'OmniGo v2.1 is now available with improved AI diagnostics and faster booking.', type: 'system', isRead: true, createdAt: '2026-08-05T08:00:00' },
];

// ─── Membership Tiers ───────────────────────────────────────
export const membershipTiers: MembershipTier[] = [
  { id: 'silver', name: 'silver', color: '#C0C0C0', price: 299, discountPercent: 5, benefits: ['5% off all bookings', 'Priority support', 'Monthly reward cards', 'Free cancellation'] },
  { id: 'gold', name: 'gold', color: '#FFD700', price: 649, discountPercent: 10, benefits: ['10% off all bookings', '24/7 Priority support', 'Weekly reward cards', 'Free cancellation', 'AI Diagnostics Pro', 'Roadside first-aid kit'] },
  { id: 'platinum', name: 'platinum', color: '#E5E4E2', price: 1299, discountPercent: 20, benefits: ['20% off all bookings', 'Dedicated support agent', 'Daily reward cards', 'Free cancellation', 'AI Diagnostics Pro', 'Free annual checkup', 'Emergency helicopter assist', 'Insurance coverage'] },
];

// ─── AI Chat Messages ───────────────────────────────────────
export const aiChatHistory: ChatMessage[] = [
  { id: 'c1', sender: 'bot', text: 'Hi! I\'m OmniBot, your AI assistant. I can help you with vehicle troubleshooting, booking assistance, and more. How can I help you today?', timestamp: '2026-08-07T14:00:00' },
  { id: 'c2', sender: 'user', text: 'My car won\'t start', timestamp: '2026-08-07T14:00:30' },
  { id: 'c3', sender: 'bot', text: 'I understand your car won\'t start. Let me help diagnose the issue.\n\n**Diagnosis Summary:**\n• Check if the battery terminals are corroded or loose\n• Listen for clicking sounds when turning the key\n• Check if headlights work (dim = battery, bright = starter)\n• Ensure the fuel tank isn\'t empty\n\nWould you like me to book a tow truck to the nearest service center?', timestamp: '2026-08-07T14:01:00' },
];

// ─── AI Bot Responses (for mock) ────────────────────────────
export const aiBotResponses: Record<string, string> = {
  'flat tire': '🔧 **Flat Tire Diagnosis:**\n\nIf you have a spare tire and tools:\n1. Park on flat ground, turn on hazards\n2. Loosen lug nuts before jacking up\n3. Replace tire with spare\n\nIf not, I can book a tow to the nearest tire shop. Would you like me to do that?',
  'overheating': '🌡️ **Overheating Engine:**\n\n⚠️ **DO NOT** open the radiator cap when hot!\n\n1. Turn off the AC and turn on the heater\n2. Pull over safely and turn off the engine\n3. Wait 30+ minutes before opening the hood\n4. Check coolant level when cool\n\nShall I book emergency towing assistance?',
  'battery': '🔋 **Battery Issues:**\n\n1. Check battery terminals for corrosion\n2. Try jump-starting with cables\n3. If the battery is 3+ years old, it may need replacement\n\nI can arrange a tow to the nearest battery replacement center.',
  'accident': '🚨 **Accident Response:**\n\n1. Ensure everyone\'s safety first\n2. Call emergency services (112)\n3. Document the scene with photos\n4. Exchange insurance details\n\nI\'ve activated **Emergency SOS**. Would you like me to dispatch a tow truck immediately?',
  default: '🤖 I can help with vehicle diagnostics, booking assistance, and roadside tips. Try asking about:\n\n• Flat tire help\n• Engine overheating\n• Battery problems\n• Accident assistance\n• Book a tow\n\nWhat would you like help with?',
};

// ─── Admin Stats ────────────────────────────────────────────
export const adminStats: AdminStats = {
  totalUsers: 15420,
  totalDrivers: 892,
  totalBookings: 48750,
  activeBookings: 127,
  totalRevenue: 2850000,
  todayRevenue: 45200,
  onlineDrivers: 342,
  averageRating: 4.6,
};

// ─── Revenue Chart Data ─────────────────────────────────────
export const revenueData: RevenueDataPoint[] = [
  { date: '2026-08-01', revenue: 38500, bookings: 145 },
  { date: '2026-08-02', revenue: 42100, bookings: 162 },
  { date: '2026-08-03', revenue: 35800, bookings: 134 },
  { date: '2026-08-04', revenue: 51200, bookings: 189 },
  { date: '2026-08-05', revenue: 47600, bookings: 178 },
  { date: '2026-08-06', revenue: 39900, bookings: 151 },
  { date: '2026-08-07', revenue: 45200, bookings: 168 },
];

// ─── Helper: Get status display ─────────────────────────────
export const statusConfig = {
  pending: { label: 'Pending', color: '#FFB800', bg: 'rgba(255, 184, 0, 0.15)' },
  searching: { label: 'Searching', color: '#00CFFF', bg: 'rgba(0, 207, 255, 0.15)' },
  driver_assigned: { label: 'Driver Assigned', color: '#0CF2FF', bg: 'rgba(12, 242, 255, 0.15)' },
  driver_arriving: { label: 'Driver Arriving', color: '#0CF2FF', bg: 'rgba(12, 242, 255, 0.15)' },
  at_pickup: { label: 'At Pickup', color: '#00FF97', bg: 'rgba(0, 255, 151, 0.15)' },
  towing: { label: 'Towing', color: '#00FF97', bg: 'rgba(0, 255, 151, 0.15)' },
  completed: { label: 'Completed', color: '#00FF97', bg: 'rgba(0, 255, 151, 0.15)' },
  cancelled: { label: 'Cancelled', color: '#FF3B3B', bg: 'rgba(255, 59, 59, 0.15)' },
};
