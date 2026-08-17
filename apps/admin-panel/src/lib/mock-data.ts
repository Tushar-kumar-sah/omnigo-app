// ─────────────────────────────────────────────────────────────────────────────
// 🌟 OMNIGO ENTERPRISE ADMIN DASHBOARD TYPES
// ─────────────────────────────────────────────────────────────────────────────

// ─── 2. Live Operations Fleet Data (Map Pins) ──────────────────────────────
export interface LiveFleetDriver {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'Flatbed Heavy-Duty' | 'Wheel-Lift' | 'Integrated Tow' | 'Motorcycle Carrier';
  vehiclePlate: string;
  status: 'available' | 'en_route' | 'arrived' | 'towing' | 'sos' | 'offline';
  lat: number;
  lng: number;
  speed: string;
  battery: string;
  rating: number;
  activeJobId?: string;
  destination?: string;
  eta?: string;
}

// ─── 3. Dispatch Center Queue & Smart Recommendations ───────────────────────
export interface DispatchRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerVehicle: string;
  pickup: string;
  dropoff: string;
  distance: string;
  vehicleTypeRequired: string;
  estimatedPrice: string;
  urgency: 'Standard' | 'Urgent' | 'Emergency SOS';
  status: 'Unassigned' | 'Auto-Dispatching' | 'Assigned';
  recommendedDrivers: {
    id: string;
    name: string;
    distanceKm: number;
    rating: number;
    vehicleType: string;
    etaMinutes: number;
  }[];
}

// ─── 4. Partner & KYC Management Data ───────────────────────────────────────
export interface DocumentItem {
  name: string;
  docNumber: string;
  issuedDate: string;
  expiryDate: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  notes?: string;
}

export interface PartnerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  pincode: string;
  dob: string;
  emergencyContact: { name: string; relation: string; phone: string };
  aadharNumber: string;
  panNumber: string;
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    payoutUpi: string;
  };
  kycStatus: 'Verified' | 'Pending Review' | 'Action Required' | 'Suspended';
  verifiedAt?: string;
  verifiedBy?: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleChassis: string;
  vehicleEngine: string;
  vehicleModelYear: string;
  vehicleCapacity: string;
  documents: {
    dl: DocumentItem;
    rc: DocumentItem;
    insurance: DocumentItem;
    fitness: DocumentItem;
    puc: DocumentItem;
    policeVerification: DocumentItem;
    truckInspection: DocumentItem;
  };
  totalTrips: number;
  acceptanceRate: number;
  cancellationRate: number;
  onlineHours: string;
  rating: number;
  walletBalance: string;
  complaintsCount: number;
  joinedDate: string;
}

// ─── 5. Dynamic Pricing Engine Configuration ────────────────────────────────
export interface VehiclePricingTier {
  category: string;
  baseFare: number;
  baseKmIncluded: number;
  perKmRate: number;
  heavyDutySurcharge: number;
}

// ─── 6. Fraud & Risk Control Center ─────────────────────────────────────────
export interface FraudRiskIncident {
  id: string;
  type: 'GPS Mismatch' | 'Payment Chargeback' | 'Repeated Cancellations' | 'Multiple Accounts' | 'Cash Discrepancy';
  severity: 'High' | 'Medium' | 'Low';
  subjectName: string;
  subjectRole: 'Driver' | 'Customer';
  description: string;
  timestamp: string;
  status: 'Open Investigation' | 'Frozen' | 'Resolved' | 'Dismissed';
}

// ─── 7. SOS Emergency Command Center ─────────────────────────────────────────
export interface SOSIncident {
  id: string;
  customerName: string;
  customerPhone: string;
  location: string;
  gpsCoords: string;
  vehicleModel: string;
  hazardType: string;
  assignedDriverName: string;
  assignedDriverPhone: string;
  driverEta: string;
  status: 'Active Alert 🚨' | 'Driver On Scene' | 'Resolved';
  policeNotified: boolean;
  timeline: { time: string; event: string }[];
}

// ─── 8. Customer & Membership Management Data ───────────────────────────────
export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  membershipTier: 'Basic' | 'Pro' | 'Elite';
  walletBalance: string;
  totalSpend: string;
  totalBookings: number;
  status: 'Active' | 'Suspended';
  savedVehicles: string[];
  joinedDate: string;
  ratingGiven: number;
}
