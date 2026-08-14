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
  paymentId?: string;
  ledgerId?: string;
  settlementId?: string;
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
  paymentId?: string;
  settlementId?: string;
  utrNumber?: string;
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

// ─────────────────────────────────────────────────────────────────────────────
// 🌟 OMNIGO PAYMENT GATEWAY, LEDGER, SETTLEMENT & PAYOUT ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1. Customer Payment Transaction (Processed by OmniGo Payment Gateway)
 */
export interface PaymentGatewayTransaction {
  paymentId: string;                 // e.g. "PAY-OMNI-78219"
  gatewayOrderId: string;            // e.g. "order_omni_98214"
  bookingId: string;                 // e.g. "BOOK-7821"
  customerId: string;
  customerName: string;
  amount: number;                    // Total paid by customer (in ₹)
  currency: 'INR';
  method: PaymentMethod;
  gatewayName: 'OmniGo Escrow Gateway' | 'Razorpay' | 'Cash Ledger';
  gatewayRef: string;                // External reference
  status: 'authorized' | 'captured' | 'failed' | 'refunded';
  paidAt: string;
}

/**
 * 2. OmniGo Double-Entry Ledger Entry
 */
export interface OmniGoLedgerEntry {
  ledgerId: string;                  // e.g. "LEDGER-2026-0045"
  bookingId: string;
  paymentId: string;
  partnerId: string;
  partnerName: string;
  grossCustomerFare: number;         // ₹ Total customer paid
  omniGoCommissionRate: number;      // e.g. 0.10 (10%)
  omniGoCommissionAmount: number;    // e.g. ₹85
  gstOnCommission: number;           // 18% GST on platform fee
  partnerGrossEarning: number;       // Fare share before adjustments
  customerTip: number;               // 100% passed through directly to partner
  partnerNetEarning: number;         // Net amount credited to partner wallet/ledger
  settlementStatus: 'unsettled' | 'batched' | 'settled';
  timestamp: string;
}

/**
 * 3. Partner Settlement Batch
 */
export interface PartnerSettlement {
  settlementId: string;              // e.g. "SETTLE-8821"
  partnerId: string;
  partnerName: string;
  bookingIds: string[];
  grossAmount: number;
  totalCommissionDeducted: number;
  netPayable: number;
  status: 'pending_clearance' | 'settled' | 'paid_out';
  createdAt: string;
  settledAt?: string;
  payoutId?: string;
}

/**
 * 4. Bank Payout Disbursement Record
 */
export interface PayoutRecord {
  payoutId: string;                  // e.g. "PAYOUT-90214"
  settlementId: string;
  partnerId: string;
  partnerName: string;
  bankName: string;
  accountNumberMasked: string;       // e.g. "•••• •••• 6789"
  ifsc: string;
  amount: number;
  mode: 'IMPS' | 'NEFT' | 'UPI';
  utrNumber: string;                 // e.g. "UTR9928172648"
  status: 'initiated' | 'success' | 'failed';
  disbursedAt: string;
}

/**
 * 5. Complete End-to-End Audit Trail (Pipeline Step 1 -> 7)
 */
export interface PaymentAuditTrail {
  bookingId: string;
  customerName: string;
  pickupLocation: string;
  dropLocation: string;
  payment: PaymentGatewayTransaction;
  ledger: OmniGoLedgerEntry;
  settlement: PartnerSettlement;
  payout: PayoutRecord;
}
