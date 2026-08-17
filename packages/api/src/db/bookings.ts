import { supabase, isSupabaseConfigured } from '../supabase';
import type { Booking, BookingStatus } from '../types';

export function mapDbBookingToBooking(dbBooking: any): any {
  if (!dbBooking) return null;
  const vehicleObj = typeof dbBooking.customer_vehicle === 'string'
    ? JSON.parse(dbBooking.customer_vehicle)
    : (dbBooking.customer_vehicle || {});

  const vehicleName = vehicleObj.make 
    ? `${vehicleObj.make} ${vehicleObj.model || ''} (${vehicleObj.plate || ''})`.trim()
    : (vehicleObj.brand ? `${vehicleObj.brand} ${vehicleObj.model || ''}`.trim() : '—');

  const customerName = dbBooking.users?.name || dbBooking.customer_name || '—';
  const customerPhone = dbBooking.users?.phone || dbBooking.customer_phone || '—';
  const driverName = dbBooking.drivers?.name 
    ? `${dbBooking.drivers.name} (${dbBooking.drivers.vehicle_plate || ''})` 
    : (dbBooking.driver_name 
        ? `${dbBooking.driver_name} (${dbBooking.driver_plate || ''})` 
        : (dbBooking.driver_id ? 'Assigned Partner' : 'Searching for Partner'));

  const pickupAddr = dbBooking.pickup_address || '—';
  const dropoffAddr = dbBooking.dropoff_address || '—';

  const statusCapitalized = dbBooking.status ? (dbBooking.status.charAt(0).toUpperCase() + dbBooking.status.slice(1)) : 'Pending';

  return {
    id: dbBooking.booking_number || (dbBooking.id ? `JOB-${dbBooking.id.substring(0, 4).toUpperCase()}` : '—'),
    uuid: dbBooking.id,
    userId: dbBooking.user_id,
    driverId: dbBooking.driver_id,
    customer: customerName,
    phone: customerPhone,
    driver: driverName,
    vehicle: vehicleName,
    vehicleTypeId: dbBooking.vehicle_type_id || 'flatbed',
    customerVehicle: vehicleObj,
    pickup: pickupAddr,
    drop: dropoffAddr,
    dropoff: {
      address: dropoffAddr,
      landmark: dbBooking.dropoff_landmark || '',
      coordinates: { latitude: 0, longitude: 0 },
    },
    status: statusCapitalized,
    bookingStatus: dbBooking.status,
    price: Number(dbBooking.estimated_price || dbBooking.final_price || 0),
    estimatedPrice: Number(dbBooking.estimated_price || 0),
    finalPrice: dbBooking.final_price ? Number(dbBooking.final_price) : undefined,
    estimatedETA: dbBooking.estimated_eta || 0,
    distance: `${dbBooking.distance_km || 0} km`,
    distanceKm: Number(dbBooking.distance_km || 0),
    payment: `${(dbBooking.payment_method || 'upi').toUpperCase()} (Escrow Auto-Capture)`,
    paymentMethod: dbBooking.payment_method || 'upi',
    paymentStatus: dbBooking.payment_status || 'pending',
    time: dbBooking.created_at ? new Date(dbBooking.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
    createdAt: dbBooking.created_at || new Date().toISOString(),
    completedAt: dbBooking.completed_at,
    driverRating: dbBooking.driver_rating ? Number(dbBooking.driver_rating) : undefined,
  };
}

export async function getBookings(filters?: { status?: string; userId?: string; driverId?: string }): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let query = supabase
      .from('bookings')
      .select('*, users(name, phone), drivers(name, vehicle_plate)')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.driverId) {
      query = query.eq('driver_id', filters.driverId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapDbBookingToBooking);
  } catch (err) {
    console.warn('getBookings error:', err);
    return [];
  }
}

export async function getBookingById(id: string): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const isUuid = id.includes('-');
    let query = supabase
      .from('bookings')
      .select('*, users(name, phone), drivers(name, vehicle_plate)');

    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.or(`id.eq.${id},booking_number.eq.${id}`);
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) return null;
    return mapDbBookingToBooking(data);
  } catch (err) {
    return null;
  }
}

export async function createBooking(data: any): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const insertPayload: any = {
      user_id: data.userId && data.userId.includes('-') ? data.userId : null,
      driver_id: data.driverId || null,
      vehicle_type_id: data.vehicleTypeId || 'flatbed',
      customer_vehicle: data.customerVehicle || {},
      pickup_address: data.pickup?.address || '—',
      dropoff_address: data.dropoff?.address || '—',
      status: data.status || 'searching',
      estimated_price: data.estimatedPrice || 0,
      distance_km: data.distance || 0,
      payment_method: data.paymentMethod || 'upi',
      payment_status: data.paymentStatus || 'pending',
    };

    const { data: created, error } = await supabase
      .from('bookings')
      .insert(insertPayload)
      .select('*, users(name, phone), drivers(name, vehicle_plate)')
      .single();

    if (error || !created) return null;
    return mapDbBookingToBooking(created);
  } catch (err) {
    console.warn('createBooking error:', err);
    return null;
  }
}

export async function updateBookingStatus(id: string, status: BookingStatus, extraData?: any): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const updatePayload: any = { status, updated_at: new Date().toISOString() };
    if (extraData?.finalPrice) updatePayload.final_price = extraData.finalPrice;
    if (extraData?.driverRating) updatePayload.driver_rating = extraData.driverRating;

    const { data: updated, error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .or(`id.eq.${id},booking_number.eq.${id}`)
      .select('*, users(name, phone), drivers(name, vehicle_plate)')
      .single();

    if (error || !updated) return null;
    return mapDbBookingToBooking(updated);
  } catch (err) {
    console.warn('updateBookingStatus error:', err);
    return null;
  }
}

export async function assignDriver(bookingId: string, driverId: string): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data: updated, error } = await supabase
      .from('bookings')
      .update({ driver_id: driverId, status: 'driver_assigned', updated_at: new Date().toISOString() })
      .or(`id.eq.${bookingId},booking_number.eq.${bookingId}`)
      .select('*, users(name, phone), drivers(name, vehicle_plate)')
      .single();

    if (error || !updated) return null;
    return mapDbBookingToBooking(updated);
  } catch (err) {
    console.warn('assignDriver error:', err);
    return null;
  }
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  return getBookings({ userId });
}

export async function getBookingsByDriver(driverId: string): Promise<Booking[]> {
  return getBookings({ driverId });
}
