export const mockDriver = {
  id: 'd1',
  name: 'Vikram Towing',
  phone: '+91 98765 43210',
  rating: 4.8,
  totalTrips: 154,
  acceptanceRate: 92,
  completionRate: 98,
  vehicle: {
    type: 'Flatbed Tow Truck',
    number: 'MH-12-XX-9999',
    make: 'Tata Ultra'
  },
  documents: {
    license: 'Verified',
    insurance: 'Verified',
    registration: 'Verified'
  }
};

export const mockJobs = [
  {
    id: 'job-001',
    customerName: 'Alice Smith',
    vehicleType: 'Sedan (Honda Civic)',
    pickup: '123 Main St, City Center',
    drop: '456 Auto Repair Shop, Northside',
    distance: '5.2 km',
    price: '₹850',
    eta: '5 min',
    status: 'completed',
    date: 'Today, 2:30 PM',
    rating: 5
  },
  {
    id: 'job-002',
    customerName: 'Bob Jones',
    vehicleType: 'SUV (Toyota RAV4)',
    pickup: '789 Highway Rd, Exit 4',
    drop: '101 Service Center, Eastside',
    distance: '12.4 km',
    price: '₹1,200',
    eta: '12 min',
    status: 'completed',
    date: 'Yesterday, 10:15 AM',
    rating: 4
  }
];

export const mockIncomingJob = {
  id: 'job-003',
  customerName: 'Charlie Brown',
  vehicleType: 'Motorcycle (Harley Davidson)',
  pickup: 'Downtown Square, 5th Ave',
  drop: 'Biker Garage, South Blvd',
  distance: '3.1 km',
  price: '₹550',
  eta: '3 min',
};
