// ─── Driver Profile ─────────────────────────────────────────────
export const mockDriver = {
  id: 'DRV-2024-0847',
  name: 'Vikram Towing Services',
  phone: '+91 98765 43210',
  email: 'vikram@omnigo.in',
  rating: 4.85,
  totalTrips: 154,
  acceptanceRate: 94,
  completionRate: 98,
  cancellationRate: 2,
  onlineHours: '148 hrs',
  memberSince: 'Jan 2024',
  vehicle: {
    type: 'Flatbed Heavy-Duty Tow Truck',
    number: 'MH-12-XX-9999',
    make: 'Tata Ultra',
    model: '1518 Flatbed',
    year: '2022',
    color: 'White & Blue',
    verificationStatus: 'Verified ✓',
    inspectionDate: '15 Jul 2026',
  },
  documents: {
    license: { name: 'Commercial Driving License', status: 'Verified', expiry: '14 Mar 2028', expiresSoon: false },
    insurance: { name: 'Commercial Vehicle Insurance', status: 'Expiring Soon', expiry: '28 Aug 2026', expiresSoon: true, daysLeft: 13 },
    registration: { name: 'Vehicle Registration Certificate (RC)', status: 'Verified', expiry: '10 Jan 2030', expiresSoon: false },
    fitnessCert: { name: 'Fitness & Roadworthiness Certificate', status: 'Verified', expiry: '15 Nov 2027', expiresSoon: false },
    pollutionCert: { name: 'PUC Pollution Certificate', status: 'Expiring Soon', expiry: '20 Aug 2026', expiresSoon: true, daysLeft: 5 },
  },
  wallet: {
    availableBalance: '₹4,850.00',
    pendingBalance: '₹1,425.00',
    totalWithdrawn: '₹62,400.00',
    autoPayoutEnabled: true,
    nextPayoutDate: 'Monday, 18 Aug 2026',
  },
  bank: {
    accountName: 'Vikram Singh',
    bankName: 'State Bank of India',
    accountNumber: '•••• •••• 6789',
    ifsc: 'SBIN0001234',
    branch: 'Shivaji Nagar, Pune',
    upiId: 'vikram@oksbi',
    isApproved: true,
  },
};

// ─── Payout History ─────────────────────────────────────────────
export const mockPayoutHistory = [
  {
    id: 'PAY-8821',
    date: '10 Aug 2026, 6:00 PM',
    amount: '₹8,450.00',
    bank: 'State Bank of India (••6789)',
    utr: 'UTR9928172648',
    status: 'Completed',
  },
  {
    id: 'PAY-8714',
    date: '03 Aug 2026, 6:00 PM',
    amount: '₹12,200.00',
    bank: 'State Bank of India (••6789)',
    utr: 'UTR9817263541',
    status: 'Completed',
  },
  {
    id: 'PAY-8609',
    date: '27 Jul 2026, 6:00 PM',
    amount: '₹9,800.00',
    bank: 'State Bank of India (••6789)',
    utr: 'UTR9736152411',
    status: 'Completed',
  },
  {
    id: 'PAY-8501',
    date: '20 Jul 2026, 6:00 PM',
    amount: '₹11,500.00',
    bank: 'State Bank of India (••6789)',
    utr: 'UTR9625143320',
    status: 'Completed',
  },
];

// ─── Completed Jobs History ─────────────────────────────────────
export const mockJobs = [
  {
    id: 'job-001',
    customerName: 'Arjun Mehta',
    customerPhone: '+91 99876 54321',
    vehicleType: 'Sedan',
    vehicleMake: 'Honda',
    vehicleModel: 'City',
    vehicleColor: 'Silver',
    vehiclePlate: 'MH-14-AB-1234',
    pickup: '123 MG Road, Pune',
    drop: 'AutoCare Garage, Kothrud',
    distance: '5.2 km',
    price: '₹850',
    baseFare: '₹300',
    distanceFare: '₹400',
    tip: '₹150',
    platformFee: '₹85',
    driverEarnings: '₹765',
    eta: '5 min',
    duration: '18 min',
    status: 'completed' as const,
    date: 'Today, 2:30 PM',
    rating: 5,
    customerRating: 4,
  },
  {
    id: 'job-002',
    customerName: 'Priya Sharma',
    customerPhone: '+91 88765 43210',
    vehicleType: 'SUV',
    vehicleMake: 'Toyota',
    vehicleModel: 'Fortuner',
    vehicleColor: 'Black',
    vehiclePlate: 'MH-12-CD-5678',
    pickup: 'NH-48, Exit 4, Pimpri',
    drop: 'Toyota Service Center, Hinjawadi',
    distance: '12.4 km',
    price: '₹1,200',
    baseFare: '₹300',
    distanceFare: '₹750',
    tip: '₹0',
    platformFee: '₹120',
    driverEarnings: '₹1,080',
    eta: '12 min',
    duration: '32 min',
    status: 'completed' as const,
    date: 'Yesterday, 10:15 AM',
    rating: 4,
    customerRating: 5,
  },
  {
    id: 'job-004',
    customerName: 'Sneha Patil',
    customerPhone: '+91 77654 32109',
    vehicleType: 'Hatchback',
    vehicleMake: 'Maruti',
    vehicleModel: 'Swift',
    vehicleColor: 'Red',
    vehiclePlate: 'MH-04-EF-9012',
    pickup: 'Koregaon Park, Pune',
    drop: 'Maruti Authorized Center, Hadapsar',
    distance: '8.7 km',
    price: '₹950',
    baseFare: '₹300',
    distanceFare: '₹550',
    tip: '₹100',
    platformFee: '₹95',
    driverEarnings: '₹855',
    eta: '8 min',
    duration: '25 min',
    status: 'completed' as const,
    date: '2 days ago',
    rating: 5,
    customerRating: 5,
  },
];

// ─── Active Incoming Job ────────────────────────────────────────
export const mockIncomingJob = {
  id: 'JOB-2024-0389',
  customerName: 'Rahul Deshmukh',
  customerPhone: '+91 98123 45678',
  customerMaskedPhone: '+91 98••• ••678',
  vehicleType: 'Motorcycle',
  vehicleMake: 'Royal Enfield',
  vehicleModel: 'Classic 350',
  vehicleColor: 'Stealth Black',
  vehiclePlate: 'MH-12-GH-3456',
  vehicleYear: '2023',
  pickup: 'Downtown Square, FC Road, Pune',
  drop: 'RE Authorized Service, Baner, Pune',
  distance: '3.1 km',
  customerPayment: '₹550.00',
  platformFee: '₹55.00',
  platformCommissionRate: '10%',
  driverEarnings: '₹495.00',
  baseFare: '₹250.00',
  distanceFare: '₹200.00',
  tip: '₹100.00',
  eta: '3 min',
  pickupDistance: '1.2 km',
  duration: '14 min',
  customerOtp: '4827',
  cancellationPenaltyRule: 'Free cancellation within 2 mins of accept. Cancelling after arriving at pickup incurs a ₹100 penalty unless customer no-show.',
  waitingChargeRule: 'Free waiting for first 5 mins. ₹10/min charged thereafter automatically added to earnings.',
};

// ─── Inspection Steps ───────────────────────────────────────────
export type InspectionStep = {
  id: number;
  label: string;
  type: 'photo' | 'video' | 'damage';
  description: string;
  required: boolean;
  frameGuide: string;
};

export const INSPECTION_STEPS: InspectionStep[] = [
  { id: 1, label: 'Front', type: 'photo', description: 'Bumper & hood condition', required: true, frameGuide: 'Position front of vehicle within the frame' },
  { id: 2, label: 'Rear', type: 'photo', description: 'Bumper & trunk condition', required: true, frameGuide: 'Position rear of vehicle within the frame' },
  { id: 3, label: 'Left Side', type: 'photo', description: 'Door & panel condition', required: true, frameGuide: 'Position left side of vehicle within the frame' },
  { id: 4, label: 'Right Side', type: 'photo', description: 'Door & panel condition', required: true, frameGuide: 'Position right side of vehicle within the frame' },
  { id: 5, label: '360° Walkaround', type: 'video', description: 'Continuous proof (~15-20s)', required: true, frameGuide: 'Walk slowly around the entire vehicle' },
  { id: 6, label: 'License Plate', type: 'photo', description: 'Close-up for verification', required: true, frameGuide: 'Focus on the license plate number' },
  { id: 7, label: 'Odometer', type: 'photo', description: 'Mileage record', required: false, frameGuide: 'Capture the dashboard odometer reading' },
  { id: 8, label: 'Existing Damage', type: 'damage', description: 'Mark & photograph damage', required: true, frameGuide: 'Tap areas with damage on the diagram' },
];

// ─── Condition Checklist ────────────────────────────────────────
export type ChecklistItem = {
  id: string;
  label: string;
  type: 'toggle' | 'select';
  options?: string[];
};

export const CONDITION_CHECKLIST: ChecklistItem[] = [
  { id: 'tyres', label: 'Tyres Inflated', type: 'toggle' },
  { id: 'keys', label: 'Keys Present', type: 'toggle' },
  { id: 'windows', label: 'Windows Up', type: 'toggle' },
  { id: 'fuel', label: 'Fuel Level', type: 'select', options: ['Empty', 'Low', 'Quarter', 'Half', 'Three-Quarter', 'Full'] },
  { id: 'lights', label: 'Lights Working', type: 'toggle' },
  { id: 'mirrors', label: 'Mirrors Intact', type: 'toggle' },
];

// ─── Cancel Reasons ─────────────────────────────────────────────
export const CANCEL_REASONS = [
  'Customer No-Show (Waited > 5 mins)',
  'Customer unreachable via phone & in-app chat',
  'Vehicle condition unsafe for towing / heavy accident',
  'Vehicle already moved or towed by someone else',
  'Customer cancelled on spot / resolved issue',
  'Accident scene road blocked by police',
  'Other emergency reason',
];

// ─── Vehicle Types ──────────────────────────────────────────────
export const VEHICLE_TYPES = [
  { id: 'sedan', label: 'Sedan', icon: 'car-sport' as const },
  { id: 'suv', label: 'SUV', icon: 'car' as const },
  { id: 'hatchback', label: 'Hatchback', icon: 'car-outline' as const },
  { id: 'motorcycle', label: 'Bike', icon: 'bicycle' as const },
  { id: 'truck', label: 'Truck', icon: 'bus' as const },
  { id: 'bus', label: 'Bus', icon: 'bus-outline' as const },
];

// ─── Notifications ──────────────────────────────────────────────
export const mockNotifications = [
  { id: 'n1', title: 'Job Completed', body: 'You earned ₹850 from Job #001', time: '2 min ago', type: 'success' as const, read: false },
  { id: 'n2', title: 'New Job Available', body: 'Pickup at MG Road, Pune — ₹1,200', time: '15 min ago', type: 'job' as const, read: false },
  { id: 'n3', title: 'Weekly Summary', body: 'You completed 12 trips this week', time: '1 hour ago', type: 'info' as const, read: true },
  { id: 'n4', title: 'Payment Received', body: '₹4,250 transferred to your bank', time: '3 hours ago', type: 'payment' as const, read: true },
  { id: 'n5', title: 'Document Expiring', body: 'Your insurance expires in 15 days', time: 'Yesterday', type: 'warning' as const, read: true },
  { id: 'n6', title: '5-Star Rating!', body: 'Arjun Mehta gave you a 5-star rating', time: '2 days ago', type: 'success' as const, read: true },
];

// ─── Earnings Data ──────────────────────────────────────────────
export const mockEarnings = {
  today: { amount: '₹1,425', trips: 3, online: '4.5h', distance: '21 km' },
  week: { amount: '₹8,750', trips: 18, online: '28h', distance: '142 km' },
  month: { amount: '₹34,200', trips: 72, online: '112h', distance: '580 km' },
};

// ─── Settings Items ─────────────────────────────────────────────
export const SETTINGS_ITEMS = [
  { id: 'notifications', label: 'Notification Preferences', icon: 'notifications-outline' as const, route: '/settings/notifications' },
  { id: 'language', label: 'Language', icon: 'language-outline' as const, route: '/settings/language' },
  { id: 'privacy', label: 'Privacy Policy', icon: 'shield-outline' as const, route: '/settings/privacy' },
  { id: 'terms', label: 'Terms & Conditions', icon: 'document-text-outline' as const, route: '/settings/terms' },
  { id: 'support', label: 'Help & Support', icon: 'help-circle-outline' as const, route: '/settings/support' },
  { id: 'about', label: 'About OmniGo', icon: 'information-circle-outline' as const, route: '/settings/about' },
];
