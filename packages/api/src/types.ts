/**
 * OmniGo Shared Types
 */

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  isVerified: boolean;
  membershipTier: 'none' | 'silver' | 'gold' | 'platinum';
  walletBalance: number;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  totalTrips: number;
  isOnline: boolean;
  isVerified: boolean;
  vehicleType: string;
  vehicleNumber: string;
  licensePlate: string;
  location: LatLng;
  earnings: DriverEarnings;
  createdAt: string;
}

export interface DriverEarnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

export interface VehicleType {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  pricePerKm: number;
  image: string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Location {
  coordinates: LatLng;
  address: string;
  landmark?: string;
}

export interface Booking {
  id: string;
  userId: string;
  driverId?: string;
  vehicleTypeId: string;
  customerVehicle: CustomerVehicle;
  pickup: Location;
  dropoff: Location;
  status: BookingStatus;
  estimatedPrice: number;
  finalPrice?: number;
  estimatedETA: number; // minutes
  distance: number; // km
  createdAt: string;
  completedAt?: string;
  driverRating?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
}

export type BookingStatus =
  | 'pending'
  | 'searching'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'at_pickup'
  | 'towing'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'upi' | 'card' | 'wallet' | 'cash';

export interface CustomerVehicle {
  number: string;
  brand: string;
  model: string;
  images?: string[];
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  bookingId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'promotion' | 'system' | 'ai';
  isRead: boolean;
  createdAt: string;
  icon?: string;
}

export interface MembershipTier {
  id: string;
  name: 'silver' | 'gold' | 'platinum';
  color: string;
  price: number;
  benefits: string[];
  discountPercent: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  todayRevenue: number;
  onlineDrivers: number;
  averageRating: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}
