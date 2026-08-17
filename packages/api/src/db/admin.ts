import { supabase, isSupabaseConfigured } from '../supabase';
import type { AdminStats } from '../types';

const EMPTY_STATS: AdminStats = {
  totalUsers: 0, totalDrivers: 0, totalBookings: 0, activeBookings: 0,
  totalRevenue: 0, todayRevenue: 0, onlineDrivers: 0, averageRating: 0,
  todaysBookings: 0, completedBookings: 0, cancelledBookings: 0,
  gmv: 0, omniGoRevenue: 0, driversOnline: 0, availableTrucks: 0, averageEta: '—',
};

export async function getDashboardStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured || !supabase) return EMPTY_STATS;
  try {
    const [usersRes, driversRes, bookingsRes, ledgerRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('drivers').select('*'),
      supabase.from('bookings').select('*'),
      supabase.from('ledger_entries').select('*'),
    ]);

    const totalUsers = usersRes.count ?? 0;
    const driversList = driversRes.data || [];
    const totalDrivers = driversList.length;
    const onlineDrivers = driversList.filter((d: any) => d.is_online).length;
    const availableTrucks = driversList.filter((d: any) => d.is_online && d.kyc_status === 'verified').length;
    const avgRating = driversList.length > 0
      ? Number((driversList.reduce((acc: number, d: any) => acc + Number(d.rating || 0), 0) / driversList.length).toFixed(1))
      : 0;

    const bookingsList = bookingsRes.data || [];
    const totalBookings = bookingsList.length;
    const today = new Date();
    const todaysBookings = bookingsList.filter((b: any) => {
      if (!b.created_at) return false;
      return new Date(b.created_at).toDateString() === today.toDateString();
    }).length;
    const activeBookings = bookingsList.filter((b: any) =>
      ['pending', 'searching', 'driver_assigned', 'driver_arriving', 'at_pickup', 'towing'].includes(b.status)
    ).length;
    const completedBookings = bookingsList.filter((b: any) => b.status === 'completed').length;
    const cancelledBookings = bookingsList.filter((b: any) => b.status === 'cancelled').length;
    const gmv = bookingsList.reduce((acc: number, b: any) => acc + Number(b.estimated_price || b.final_price || 0), 0);

    const ledgerList = ledgerRes.data || [];
    const totalRevenue = ledgerList.reduce((acc: number, l: any) => acc + Number(l.commission_amount || 0), 0);
    const omniGoRevenue = totalRevenue > 0 ? totalRevenue : Math.round(gmv * 0.15);

    return {
      totalUsers,
      totalDrivers,
      totalBookings,
      activeBookings,
      totalRevenue,
      todayRevenue: Math.round(totalRevenue * 0.14),
      onlineDrivers,
      averageRating: avgRating,
      todaysBookings,
      completedBookings,
      cancelledBookings,
      gmv,
      omniGoRevenue,
      driversOnline: onlineDrivers,
      availableTrucks,
      averageEta: '—',
    };
  } catch (err) {
    console.warn('getDashboardStats error:', err);
    return EMPTY_STATS;
  }
}

export async function getRevenueData(period: string = '7d'): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) return [];

    const dayMap: Record<string, { name: string; revenue: number; gmv: number; bookings: number }> = {};
    data.forEach((entry: any) => {
      const d = entry.created_at ? new Date(entry.created_at) : new Date();
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      if (!dayMap[dayName]) {
        dayMap[dayName] = { name: dayName, revenue: 0, gmv: 0, bookings: 0 };
      }
      dayMap[dayName].revenue += Number(entry.commission_amount || 0);
      dayMap[dayName].gmv += Number(entry.gross_customer_fare || 0);
      dayMap[dayName].bookings += 1;
    });

    return Object.values(dayMap);
  } catch (err) {
    return [];
  }
}

export async function getFleetStatus(): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return [];
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      phone: d.phone,
      vehicleType: d.vehicle_type || 'Flatbed Heavy-Duty',
      vehiclePlate: d.vehicle_plate || '—',
      status: d.is_online ? 'available' : 'offline',
      lat: d.latitude || 0,
      lng: d.longitude || 0,
      speed: '0 km/h',
      battery: '—',
      rating: Number(d.rating || 0),
    }));
  } catch (err) {
    return [];
  }
}

export async function getDispatchQueue(): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, users(name, phone)')
      .in('status', ['pending', 'searching'])
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) return [];

    return data.map((b: any) => {
      const u = b.users || {};
      const v = typeof b.customer_vehicle === 'string' ? JSON.parse(b.customer_vehicle) : (b.customer_vehicle || {});
      const vName = v.make ? `${v.make} ${v.model || ''}` : (v.brand ? `${v.brand} ${v.model || ''}` : '—');
      return {
        uuid: b.id,
        id: b.booking_number || `REQ-${b.id?.substring(0, 4)}`,
        customerName: u.name || 'Customer',
        customerPhone: u.phone || '—',
        customerVehicle: vName,
        vehicleTypeRequired: b.vehicle_type_id || 'Flatbed',
        pickup: b.pickup_address || '—',
        dropoff: b.dropoff_address || '—',
        distance: `${b.distance_km || 0} km`,
        estimatedPrice: Number(b.estimated_price || 0),
        urgency: 'Standard',
        timeWaiting: b.created_at ? getTimeAgo(b.created_at) : '—',
        status: b.status,
        createdAt: b.created_at,
        recommendedDrivers: [],
      };
    });
  } catch (err) {
    console.warn('getDispatchQueue error:', err);
    return [];
  }
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ago`;
}

export async function getFraudIncidents(): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('fraud_incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function getPricingRules(): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return {};
  try {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return {};
    return data;
  } catch (err) {
    return {};
  }
}

export async function getVehicleTypes(): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('vehicle_types')
      .select('*');
    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function updatePricingRules(data: any): Promise<any> {
  return data;
}
