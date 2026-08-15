// ─────────────────────────────────────────────────────────────────────────────
// 🌟 OMNIGO ENTERPRISE ADMIN DASHBOARD MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

export const adminStats = {
  totalUsers: 15420,
  totalDrivers: 892,
  totalBookings: 48750,
  todaysRevenue: 45200,
  activeDrivers: 324,
  // Required 9 KPIs:
  todaysBookings: 142,
  activeBookings: 18,
  completedBookings: 118,
  cancelledBookings: 6,
  gmv: 184500,
  omniGoRevenue: 27675,
  driversOnline: 324,
  availableTrucks: 89,
  averageEta: '8.4 min',
};

// ─── 1. Revenue & Bookings Trend Data ───────────────────────────────────────
export const revenueData = [
  { name: 'Mon', revenue: 40000, bookings: 240, gmv: 265000 },
  { name: 'Tue', revenue: 30000, bookings: 139, gmv: 200000 },
  { name: 'Wed', revenue: 20000, bookings: 98,  gmv: 135000 },
  { name: 'Thu', revenue: 27800, bookings: 190, gmv: 185000 },
  { name: 'Fri', revenue: 38900, bookings: 280, gmv: 259000 },
  { name: 'Sat', revenue: 45900, bookings: 380, gmv: 305000 },
  { name: 'Sun', revenue: 54900, bookings: 430, gmv: 365000 },
];

export const hourlyActivityData = [
  { time: '00:00', requests: 12, drivers: 45 },
  { time: '04:00', requests: 8,  drivers: 30 },
  { time: '08:00', requests: 64, drivers: 180 },
  { time: '12:00', requests: 88, drivers: 290 },
  { time: '16:00', requests: 95, drivers: 320 },
  { time: '20:00', requests: 110, drivers: 310 },
  { time: '23:00', requests: 35, drivers: 140 },
];

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

export const liveFleetDrivers: LiveFleetDriver[] = [
  {
    id: 'DRV-101',
    name: 'Vikram Singh',
    phone: '+91 98765 43210',
    vehicleType: 'Flatbed Heavy-Duty',
    vehiclePlate: 'MH-12-XX-9999',
    status: 'en_route',
    lat: 18.5204,
    lng: 73.8567,
    speed: '42 km/h',
    battery: '88%',
    rating: 4.85,
    activeJobId: 'JOB-7821',
    destination: 'MG Road, Near Brigade Gateway',
    eta: '6 min',
  },
  {
    id: 'DRV-102',
    name: 'Ramesh Patil',
    phone: '+91 98765 43211',
    vehicleType: 'Wheel-Lift',
    vehiclePlate: 'KA-01-AB-1234',
    status: 'available',
    lat: 12.9716,
    lng: 77.5946,
    speed: '0 km/h',
    battery: '94%',
    rating: 4.9,
  },
  {
    id: 'DRV-103',
    name: 'Suresh Kumar',
    phone: '+91 98765 43212',
    vehicleType: 'Flatbed Heavy-Duty',
    vehiclePlate: 'KA-02-CD-5678',
    status: 'towing',
    lat: 12.9352,
    lng: 77.6245,
    speed: '35 km/h',
    battery: '72%',
    rating: 4.75,
    activeJobId: 'JOB-7802',
    destination: 'AutoFix Garage, Whitefield',
    eta: '18 min',
  },
  {
    id: 'DRV-104',
    name: 'Amit Deshmukh',
    phone: '+91 98765 43213',
    vehicleType: 'Integrated Tow',
    vehiclePlate: 'MH-14-EF-9012',
    status: 'arrived',
    lat: 18.5598,
    lng: 73.7898,
    speed: '0 km/h',
    battery: '65%',
    rating: 4.8,
    activeJobId: 'JOB-7798',
    destination: 'At Pickup Location (Hinjawadi)',
    eta: 'Arrived',
  },
  {
    id: 'DRV-105',
    name: 'Anil Yadav',
    phone: '+91 98765 43214',
    vehicleType: 'Flatbed Heavy-Duty',
    vehiclePlate: 'KA-03-GH-3456',
    status: 'sos',
    lat: 12.9141,
    lng: 77.6109,
    speed: '0 km/h',
    battery: '40%',
    rating: 4.65,
    activeJobId: 'SOS-991',
    destination: 'Emergency Distress: Electronic City Flyover',
    eta: 'Immediate Response',
  },
  {
    id: 'DRV-106',
    name: 'Santosh Shinde',
    phone: '+91 98765 43215',
    vehicleType: 'Motorcycle Carrier',
    vehiclePlate: 'MH-12-IJ-7890',
    status: 'available',
    lat: 18.5089,
    lng: 73.9259,
    speed: '0 km/h',
    battery: '99%',
    rating: 4.95,
  },
  {
    id: 'DRV-107',
    name: 'Deepak Rao',
    phone: '+91 98765 43216',
    vehicleType: 'Wheel-Lift',
    vehiclePlate: 'KA-05-KL-2345',
    status: 'offline',
    lat: 12.9856,
    lng: 77.5345,
    speed: '0 km/h',
    battery: '15%',
    rating: 4.4,
  },
];

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

export const dispatchQueue: DispatchRequest[] = [
  {
    id: 'JOB-7830',
    customerName: 'Rohit Kulkarni',
    customerPhone: '+91 98231 45678',
    customerVehicle: 'Hyundai Creta (SUV) • White',
    pickup: 'Koramangala 4th Block, Bangalore',
    dropoff: 'Hyundai Authorized Service, Indiranagar',
    distance: '6.4 km',
    vehicleTypeRequired: 'Flatbed Heavy-Duty',
    estimatedPrice: '₹950',
    urgency: 'Urgent',
    status: 'Unassigned',
    recommendedDrivers: [
      { id: 'DRV-102', name: 'Ramesh Patil', distanceKm: 1.8, rating: 4.9, vehicleType: 'Flatbed Heavy-Duty', etaMinutes: 5 },
      { id: 'DRV-101', name: 'Vikram Singh', distanceKm: 3.4, rating: 4.85, vehicleType: 'Flatbed Heavy-Duty', etaMinutes: 9 },
      { id: 'DRV-104', name: 'Amit Deshmukh', distanceKm: 5.1, rating: 4.8, vehicleType: 'Wheel-Lift', etaMinutes: 14 },
    ],
  },
  {
    id: 'JOB-7831',
    customerName: 'Ananya Sen',
    customerPhone: '+91 97123 89012',
    customerVehicle: 'Honda Activa 6G (2-Wheeler) • Blue',
    pickup: 'FC Road, Shivaji Nagar, Pune',
    dropoff: 'SpeedMoto Repairs, Kothrud',
    distance: '4.2 km',
    vehicleTypeRequired: 'Motorcycle Carrier',
    estimatedPrice: '₹450',
    urgency: 'Standard',
    status: 'Unassigned',
    recommendedDrivers: [
      { id: 'DRV-106', name: 'Santosh Shinde', distanceKm: 2.1, rating: 4.95, vehicleType: 'Motorcycle Carrier', etaMinutes: 6 },
    ],
  },
  {
    id: 'SOS-992',
    customerName: 'Meera Nambiar',
    customerPhone: '+91 99887 11223',
    customerVehicle: 'Tata Harrier • Engine Overheat on Highway',
    pickup: 'NICE Ring Road, Exit 2, Bangalore',
    dropoff: 'Tata Motors Workshop, Bannerghatta',
    distance: '14.8 km',
    estimatedPrice: '₹1,850',
    vehicleTypeRequired: 'Flatbed Heavy-Duty',
    urgency: 'Emergency SOS',
    status: 'Auto-Dispatching',
    recommendedDrivers: [
      { id: 'DRV-103', name: 'Suresh Kumar', distanceKm: 3.2, rating: 4.75, vehicleType: 'Flatbed Heavy-Duty', etaMinutes: 8 },
    ],
  },
];

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

export const partnerList: PartnerRecord[] = [
  {
    id: 'DRV-2024-0847',
    name: 'Vikram Singh',
    phone: '+91 98765 43210',
    email: 'vikram@omnigo.in',
    city: 'Pune',
    address: 'Flat 402, Shiv Shrushti Heights, Kothrud, Pune',
    pincode: '411038',
    dob: '14 May 1989',
    emergencyContact: { name: 'Sunita Singh', relation: 'Spouse', phone: '+91 98765 99881' },
    aadharNumber: 'XXXX-XXXX-8921',
    panNumber: 'BKDPS9821L',
    bankDetails: {
      accountHolder: 'Vikram Pratap Singh',
      bankName: 'HDFC Bank Ltd.',
      accountNumber: '50100482910291',
      ifsc: 'HDFC0001248',
      payoutUpi: 'vikram.singh@okhdfcbank',
    },
    kycStatus: 'Verified',
    verifiedAt: '12 Jan 2024, 15:30 IST',
    verifiedBy: 'SuperAdmin (ID: OMNI-ADM-01)',
    vehicleType: 'Tata Ultra 1518 Flatbed Hydraulic',
    vehiclePlate: 'MH-12-XX-9999',
    vehicleChassis: 'MAT618029K9L88102',
    vehicleEngine: '4SP-CR-982188',
    vehicleModelYear: '2023',
    vehicleCapacity: '8.5 Tonne Tow Capacity',
    documents: {
      dl: { name: 'Commercial Driving License', docNumber: 'MH12-20110098211', issuedDate: '10-06-2015', expiryDate: '09-06-2035', status: 'Verified' },
      rc: { name: 'Vehicle Registration Certificate', docNumber: 'RC-MH12XX9999-COM', issuedDate: '15-01-2023', expiryDate: '14-01-2038', status: 'Verified' },
      insurance: { name: 'Commercial Comprehensive Insurance', docNumber: 'ICICI-LOMB-9928172', issuedDate: '01-09-2025', expiryDate: '31-08-2026', status: 'Verified' },
      fitness: { name: 'Commercial Vehicle Fitness Certificate', docNumber: 'FIT-PUN-2024-8819', issuedDate: '12-01-2024', expiryDate: '11-01-2027', status: 'Verified' },
      puc: { name: 'Pollution Under Control (PUC)', docNumber: 'PUC-MH12-2026-99', issuedDate: '10-05-2026', expiryDate: '09-11-2026', status: 'Verified' },
      policeVerification: { name: 'Police Clearance Certificate', docNumber: 'PCC-PUNE-2024-0091', issuedDate: '05-01-2024', expiryDate: '04-01-2029', status: 'Verified' },
      truckInspection: { name: 'Hydraulic Winch & Boom Safety Audit', docNumber: 'INSP-OMNI-8810', issuedDate: '12-01-2024', expiryDate: '11-01-2025', status: 'Verified' },
    },
    totalTrips: 154,
    acceptanceRate: 94,
    cancellationRate: 2,
    onlineHours: '148 hrs',
    rating: 4.85,
    walletBalance: '₹4,850.00',
    complaintsCount: 0,
    joinedDate: 'Jan 2024',
  },
  {
    id: 'DRV-2024-0912',
    name: 'Ramesh Patil',
    phone: '+91 98765 43211',
    email: 'ramesh@omnigo.in',
    city: 'Bangalore',
    address: 'No. 24, 7th Cross, Koramangala 3rd Block, Bangalore',
    pincode: '560034',
    dob: '22 Aug 1991',
    emergencyContact: { name: 'Geetha Patil', relation: 'Spouse', phone: '+91 98765 11223' },
    aadharNumber: 'XXXX-XXXX-4410',
    panNumber: 'APRPP4410M',
    bankDetails: {
      accountHolder: 'Ramesh B Patil',
      bankName: 'State Bank of India',
      accountNumber: '30491829401',
      ifsc: 'SBIN0004128',
      payoutUpi: 'rameshpatil@oksbi',
    },
    kycStatus: 'Verified',
    verifiedAt: '18 Nov 2023, 11:20 IST',
    verifiedBy: 'SuperAdmin (ID: OMNI-ADM-01)',
    vehicleType: 'Mahindra Bolero Tow Truck',
    vehiclePlate: 'KA-01-AB-1234',
    vehicleChassis: 'MA1MB2M82910398',
    vehicleEngine: 'mHawk75-9921',
    vehicleModelYear: '2022',
    vehicleCapacity: '4.0 Tonne Under-Lift Capacity',
    documents: {
      dl: { name: 'Commercial Driving License', docNumber: 'KA01-20140029182', issuedDate: '14-04-2014', expiryDate: '13-04-2034', status: 'Verified' },
      rc: { name: 'Vehicle Registration Certificate', docNumber: 'RC-KA01AB1234-COM', issuedDate: '20-03-2022', expiryDate: '19-03-2037', status: 'Verified' },
      insurance: { name: 'Commercial Comprehensive Insurance', docNumber: 'BAJAJ-ALL-881920', issuedDate: '15-11-2025', expiryDate: '14-11-2026', status: 'Verified' },
      fitness: { name: 'Commercial Vehicle Fitness Certificate', docNumber: 'FIT-BLR-2023-4412', issuedDate: '15-11-2023', expiryDate: '14-11-2026', status: 'Verified' },
      puc: { name: 'Pollution Under Control (PUC)', docNumber: 'PUC-KA01-2026-12', issuedDate: '01-06-2026', expiryDate: '30-11-2026', status: 'Verified' },
      policeVerification: { name: 'Police Clearance Certificate', docNumber: 'PCC-BLR-2023-8821', issuedDate: '10-11-2023', expiryDate: '09-11-2028', status: 'Verified' },
      truckInspection: { name: 'Hydraulic Winch & Boom Safety Audit', docNumber: 'INSP-OMNI-9912', issuedDate: '16-11-2023', expiryDate: '15-11-2024', status: 'Verified' },
    },
    totalTrips: 320,
    acceptanceRate: 98,
    cancellationRate: 1,
    onlineHours: '280 hrs',
    rating: 4.9,
    walletBalance: '₹8,420.00',
    complaintsCount: 1,
    joinedDate: 'Nov 2023',
  },
  {
    id: 'DRV-2024-1044',
    name: 'Rajesh Gokhale',
    phone: '+91 98123 45670',
    email: 'rajesh@gmail.com',
    city: 'Pune',
    address: 'Survey 88, Near Toll Plaza, Tathawade, Pune',
    pincode: '411033',
    dob: '05 Oct 1994',
    emergencyContact: { name: 'Anil Gokhale', relation: 'Brother', phone: '+91 98123 99882' },
    aadharNumber: 'XXXX-XXXX-6612',
    panNumber: 'ARGPG6612Q',
    bankDetails: {
      accountHolder: 'Rajesh S Gokhale',
      bankName: 'Axis Bank',
      accountNumber: '914010048291028',
      ifsc: 'UTIB0000881',
      payoutUpi: 'rajeshgokhale@axisbank',
    },
    kycStatus: 'Pending Review',
    vehicleType: 'Ashok Leyland Dost Flatbed',
    vehiclePlate: 'MH-14-TC-8812',
    vehicleChassis: 'MB1D2910K8291038',
    vehicleEngine: 'TD-CR-881920',
    vehicleModelYear: '2024',
    vehicleCapacity: '3.5 Tonne Flatbed Bed',
    documents: {
      dl: { name: 'Commercial Driving License', docNumber: 'MH14-20180019283', issuedDate: '15-08-2018', expiryDate: '14-08-2038', status: 'Pending', notes: 'Review physical signature' },
      rc: { name: 'Vehicle Registration Certificate', docNumber: 'RC-MH14TC8812-COM', issuedDate: '01-08-2024', expiryDate: '31-07-2039', status: 'Pending', notes: 'Verify chassis engraving match' },
      insurance: { name: 'Commercial Comprehensive Insurance', docNumber: 'TATA-AIG-991820', issuedDate: '02-08-2026', expiryDate: '01-08-2027', status: 'Pending', notes: 'Check active policy cover' },
      fitness: { name: 'Commercial Vehicle Fitness Certificate', docNumber: 'FIT-PUN-2026-9912', issuedDate: '05-08-2026', expiryDate: '04-08-2028', status: 'Pending', notes: 'Inspect RTO seal' },
      puc: { name: 'Pollution Under Control (PUC)', docNumber: 'PUC-MH14-2026-88', issuedDate: '08-08-2026', expiryDate: '07-02-2027', status: 'Pending', notes: 'Verify emission norms' },
      policeVerification: { name: 'Police Clearance Certificate', docNumber: 'PCC-PUN-2026-1142', issuedDate: '10-08-2026', expiryDate: '09-08-2031', status: 'Pending', notes: 'Verify criminal record check' },
      truckInspection: { name: 'Hydraulic Winch & Boom Safety Audit', docNumber: 'INSP-OMNI-1044', issuedDate: '14-08-2026', expiryDate: '13-08-2027', status: 'Pending', notes: 'Inspect winch cable & safety wheel chocks' },
    },
    totalTrips: 0,
    acceptanceRate: 0,
    cancellationRate: 0,
    onlineHours: '0 hrs',
    rating: 5.0,
    walletBalance: '₹0.00',
    complaintsCount: 0,
    joinedDate: '15 Aug 2026',
  },
  {
    id: 'DRV-2024-0720',
    name: 'Manish Rawat',
    phone: '+91 98345 67890',
    email: 'manish@yahoo.com',
    city: 'Bangalore',
    address: 'B-12, Peenya Industrial Area, 4th Phase, Bangalore',
    pincode: '560058',
    dob: '18 Dec 1987',
    emergencyContact: { name: 'Kavita Rawat', relation: 'Spouse', phone: '+91 98345 11992' },
    aadharNumber: 'XXXX-XXXX-3341',
    panNumber: 'BMRPR3341K',
    bankDetails: {
      accountHolder: 'Manish Rawat',
      bankName: 'Canara Bank',
      accountNumber: '0482101089201',
      ifsc: 'CNRB0000482',
      payoutUpi: 'manishrawat@cnrb',
    },
    kycStatus: 'Suspended',
    vehicleType: 'Tata 407 Wheel-Lift',
    vehiclePlate: 'KA-04-XX-4412',
    vehicleChassis: 'MAT407029K881920',
    vehicleEngine: '4SP-TURBO-8819',
    vehicleModelYear: '2021',
    vehicleCapacity: '5.0 Tonne Wheel-Lift',
    documents: {
      dl: { name: 'Commercial Driving License', docNumber: 'KA04-20120091829', issuedDate: '10-02-2012', expiryDate: '09-02-2032', status: 'Verified' },
      rc: { name: 'Vehicle Registration Certificate', docNumber: 'RC-KA04XX4412-COM', issuedDate: '18-05-2021', expiryDate: '17-05-2036', status: 'Verified' },
      insurance: { name: 'Commercial Comprehensive Insurance', docNumber: 'NEW-IND-881920', issuedDate: '10-04-2025', expiryDate: '09-04-2026', status: 'Rejected', notes: 'Policy lapsed & not renewed' },
      fitness: { name: 'Commercial Vehicle Fitness Certificate', docNumber: 'FIT-BLR-2022-8812', issuedDate: '12-05-2022', expiryDate: '11-05-2024', status: 'Rejected', notes: 'Expired fitness certificate' },
      puc: { name: 'Pollution Under Control (PUC)', docNumber: 'PUC-KA04-2026-44', issuedDate: '10-01-2026', expiryDate: '09-07-2026', status: 'Verified' },
      policeVerification: { name: 'Police Clearance Certificate', docNumber: 'PCC-BLR-2021-9928', issuedDate: '15-05-2021', expiryDate: '14-05-2026', status: 'Verified' },
      truckInspection: { name: 'Hydraulic Winch & Boom Safety Audit', docNumber: 'INSP-OMNI-0720', issuedDate: '18-05-2021', expiryDate: '17-05-2022', status: 'Rejected', notes: 'Hydraulic leak detected on boom cylinder' },
    },
    totalTrips: 84,
    acceptanceRate: 65,
    cancellationRate: 18,
    onlineHours: '52 hrs',
    rating: 3.7,
    walletBalance: '₹1,200.00',
    complaintsCount: 4,
    joinedDate: 'Mar 2024',
  },
];

// ─── 5. Dynamic Pricing Engine Configuration ────────────────────────────────
export interface VehiclePricingTier {
  category: string;
  baseFare: number;
  baseKmIncluded: number;
  perKmRate: number;
  heavyDutySurcharge: number;
}

export const pricingTiers: VehiclePricingTier[] = [
  { category: '2-Wheeler (Motorcycle/Scooter)', baseFare: 350, baseKmIncluded: 3, perKmRate: 12, heavyDutySurcharge: 0 },
  { category: 'Hatchback / Compact', baseFare: 500, baseKmIncluded: 3, perKmRate: 15, heavyDutySurcharge: 0 },
  { category: 'Sedan / Luxury Compact', baseFare: 650, baseKmIncluded: 3, perKmRate: 18, heavyDutySurcharge: 0 },
  { category: 'SUV / Premium 4x4', baseFare: 850, baseKmIncluded: 3, perKmRate: 22, heavyDutySurcharge: 100 },
  { category: 'Commercial Van / Tempo', baseFare: 1100, baseKmIncluded: 5, perKmRate: 26, heavyDutySurcharge: 250 },
  { category: 'Heavy Truck / Bus', baseFare: 2500, baseKmIncluded: 5, perKmRate: 45, heavyDutySurcharge: 800 },
];

export const dynamicPricingRules = {
  nightChargeMultiplier: 1.25, // 11 PM to 6 AM (25% extra)
  waitingChargePerMin: 5,      // After 5 mins grace period
  emergencySosCharge: 300,     // Direct SOS immediate rush fee
  highwayTollPolicy: 'Actuals charged via FASTag / User Pass-through',
  platformCommissionPercent: 10, // 10% standard OmniGo cut
  gstRate: 18,                 // 18% GST on platform service fee
  activeSurgeZones: [
    { zoneName: 'Indiranagar / MG Road (Bangalore)', multiplier: 1.4, reason: 'High Monsoon Breakdown Demand' },
    { zoneName: 'Mumbai-Pune Expressway Toll Plaza', multiplier: 1.3, reason: 'Highway Heavy Incident Rush' },
  ],
};

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

export const fraudRiskIncidents: FraudRiskIncident[] = [
  {
    id: 'RISK-8812',
    type: 'GPS Mismatch',
    severity: 'High',
    subjectName: 'Manish Rawat (Driver)',
    subjectRole: 'Driver',
    description: 'Driver completed Trip #7721 marked "Dropoff Complete" while GPS coordinates were 12.4 km away from AutoFix Garage.',
    timestamp: '15 Aug 2026, 11:45 AM',
    status: 'Frozen',
  },
  {
    id: 'RISK-8813',
    type: 'Repeated Cancellations',
    severity: 'Medium',
    subjectName: 'Karan Mehra (Customer)',
    subjectRole: 'Customer',
    description: '4 consecutive bookings cancelled within 90 seconds after driver assignment on same device.',
    timestamp: '14 Aug 2026, 4:20 PM',
    status: 'Open Investigation',
  },
  {
    id: 'RISK-8814',
    type: 'Multiple Accounts',
    severity: 'High',
    subjectName: 'DeviceId: 98f4-22a1-xx (3 Accounts)',
    subjectRole: 'Customer',
    description: 'Same IMEI / device fingerprint detected operating 3 different user accounts to farm welcome promos.',
    timestamp: '13 Aug 2026, 2:10 PM',
    status: 'Frozen',
  },
  {
    id: 'RISK-8815',
    type: 'Payment Chargeback',
    severity: 'Medium',
    subjectName: 'Rohan Deshmukh (Customer)',
    subjectRole: 'Customer',
    description: 'Bank payment dispute raised on Razorpay for ₹1,200 after tow was verified and completed.',
    timestamp: '12 Aug 2026, 10:00 AM',
    status: 'Open Investigation',
  },
];

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

export const activeSOSIncidents: SOSIncident[] = [
  {
    id: 'SOS-991',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 99234 56789',
    location: 'Electronic City Elevated Flyover (Pillar 142), Bangalore',
    gpsCoords: '12.9141° N, 77.6109° E',
    vehicleModel: 'Honda City (KA-01-MH-4521) • Smoke from Bonnet',
    hazardType: 'Engine Fire Hazard / Dark Highway Spot',
    assignedDriverName: 'Anil Yadav ( टाटा 1518 Flatbed )',
    assignedDriverPhone: '+91 98765 43214',
    driverEta: '3 min away',
    status: 'Active Alert 🚨',
    policeNotified: true,
    timeline: [
      { time: '14:22:10', event: 'SOS Triggered by customer on mobile app.' },
      { time: '14:22:15', event: 'Live GPS tracked to E-City flyover pillar 142.' },
      { time: '14:22:30', event: 'Emergency Flatbed Driver Anil Yadav dispatched with Priority 1.' },
      { time: '14:23:00', event: 'Automated notification sent to Traffic Police Control (112).' },
      { time: '14:24:10', event: 'Customer contacted via Masked Call: Safety protocol instructed.' },
    ],
  },
];

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

export const customerList: CustomerRecord[] = [
  {
    id: 'USR-2024-001',
    name: 'Rahul Sharma',
    phone: '+91 99876 54321',
    email: 'rahul@gmail.com',
    membershipTier: 'Pro',
    walletBalance: '₹450.00',
    totalSpend: '₹14,250.00',
    totalBookings: 12,
    status: 'Active',
    savedVehicles: ['Maruti Swift Dzire (KA 01 MH 4521)', 'Royal Enfield 350'],
    joinedDate: 'Jan 2024',
    ratingGiven: 4.9,
  },
  {
    id: 'USR-2024-002',
    name: 'Priya Sharma',
    phone: '+91 88765 43210',
    email: 'priya@outlook.com',
    membershipTier: 'Elite',
    walletBalance: '₹1,200.00',
    totalSpend: '₹28,900.00',
    totalBookings: 24,
    status: 'Active',
    savedVehicles: ['Toyota Fortuner (MH 12 CD 5678)', 'BMW 3 Series'],
    joinedDate: 'Nov 2023',
    ratingGiven: 5.0,
  },
  {
    id: 'USR-2024-003',
    name: 'Sneha Patil',
    phone: '+91 77654 32109',
    email: 'sneha@gmail.com',
    membershipTier: 'Basic',
    walletBalance: '₹0.00',
    totalSpend: '₹1,850.00',
    totalBookings: 2,
    status: 'Active',
    savedVehicles: ['Hyundai i20 (MH 04 EF 9012)'],
    joinedDate: 'Aug 2024',
    ratingGiven: 4.8,
  },
];

// ─── 9. Analytics & Cohort Data ─────────────────────────────────────────────
export const analyticsAovData = [
  { month: 'Mar', aov: 720, repeatRate: 34 },
  { month: 'Apr', aov: 780, repeatRate: 38 },
  { month: 'May', aov: 820, repeatRate: 42 },
  { month: 'Jun', aov: 890, repeatRate: 45 },
  { month: 'Jul', aov: 940, repeatRate: 49 },
  { month: 'Aug', aov: 1020, repeatRate: 54 },
];

export const peakLocationDemand = [
  { location: 'Indiranagar / MG Road, Bangalore', percentage: 28 },
  { location: 'Koramangala / HSR Layout, Bangalore', percentage: 24 },
  { location: 'Mumbai-Pune Expressway Toll Plaza', percentage: 20 },
  { location: 'Hinjawadi IT Park, Pune', percentage: 16 },
  { location: 'Airport Road / Viman Nagar, Pune', percentage: 12 },
];

export const cancellationReasonsBreakdown = [
  { reason: 'Customer found alternative repair', value: 45 },
  { reason: 'Driver took too long to arrive', value: 28 },
  { reason: 'Booked wrong vehicle class', value: 15 },
  { reason: 'Duplicate accidental booking', value: 12 },
];

export const serviceTypeDemand = [
  { service: 'Flatbed Towing (Accident/Breakdown)', count: 1840 },
  { service: 'Wheel-Lift Towing (Towing Garage)', count: 920 },
  { service: 'Battery Jumpstart & Fuel Assist', count: 480 },
  { service: 'Heavy Truck Highway Recovery', count: 210 },
  { service: '2-Wheeler Carrier Transport', count: 350 },
];

// Backward-compat exports
export const users = customerList;
export const drivers = partnerList;
export const bookings = [
  { id: 'JOB-7821', customer: 'Rahul Sharma', driver: 'Vikram Singh', vehicle: 'Sedan', pickup: 'MG Road', drop: 'Whitefield', status: 'Completed', price: 850, date: '2026-08-15' },
  { id: 'JOB-7802', customer: 'Priya Sharma', driver: 'Vikram Singh', vehicle: 'SUV', pickup: 'Pimpri', drop: 'Hinjawadi', status: 'Completed', price: 1200, date: '2026-08-14' },
  { id: 'JOB-7798', customer: 'Sneha Patil', driver: 'Ramesh Patil', vehicle: 'Hatchback', pickup: 'Koregaon Park', drop: 'Hadapsar', status: 'Completed', price: 950, date: '2026-08-13' },
];
