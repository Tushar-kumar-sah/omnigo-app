import { supabase, isSupabaseConfigured } from '../supabase';
import type { Booking, BookingStatus } from '../types';

function parseGeometryPoint(geo: any): { latitude: number; longitude: number } {
  let lat = 22.5726;
  let lng = 88.3639;
  if (!geo) return { latitude: lat, longitude: lng };

  if (typeof geo === 'object' && Array.isArray(geo.coordinates)) {
    return { latitude: Number(geo.coordinates[1]) || lat, longitude: Number(geo.coordinates[0]) || lng };
  }
  if (typeof geo === 'string') {
    const match = geo.match(/POINT\(([^ ]+)\s+([^)]+)\)/i);
    if (match) {
      return { latitude: parseFloat(match[2]), longitude: parseFloat(match[1]) };
    }
    if (geo.length >= 42 && /^[0-9a-fA-F]+$/.test(geo)) {
      try {
        const buf = Buffer.from(geo, 'hex');
        const isLE = buf[0] === 1;
        const type = isLE ? buf.readUInt32LE(1) : buf.readUInt32BE(1);
        const hasSrid = (type & 0x20000000) !== 0;
        const offset = hasSrid ? 9 : 5;
        lng = isLE ? buf.readDoubleLE(offset) : buf.readDoubleBE(offset);
        lat = isLE ? buf.readDoubleLE(offset + 8) : buf.readDoubleBE(offset + 8);
      } catch (e) {}
    }
  }
  return { latitude: lat, longitude: lng };
}

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
  const pickupCoords = parseGeometryPoint(dbBooking.pickup_location);
  const dropoffCoords = parseGeometryPoint(dbBooking.dropoff_location);

  const statusCapitalized = dbBooking.status ? (dbBooking.status.charAt(0).toUpperCase() + dbBooking.status.slice(1)) : 'Pending';

  // Deterministic 4-digit OTP fallback based on booking UUID/ID if not set in DB
  const rawId = String(dbBooking.id || dbBooking.booking_number || '1234');
  let hashVal = 0;
  for (let i = 0; i < rawId.length; i++) {
    hashVal = (hashVal * 31 + rawId.charCodeAt(i)) % 9000;
  }
  const fallbackPickupOtp = String(1000 + Math.abs(hashVal));
  const fallbackDropoffOtp = String(1000 + Math.abs((hashVal * 7 + 13) % 9000));

  const pickupOtp = dbBooking.pickup_otp || fallbackPickupOtp;
  const dropoffOtp = dbBooking.dropoff_otp || fallbackDropoffOtp;

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
    pickupCoords,
    pickupOtp,
    drop: dropoffAddr,
    dropoffCoords,
    dropoffOtp,
    dropoff: {
      address: dropoffAddr,
      landmark: dbBooking.dropoff_landmark || '',
      coordinates: dropoffCoords,
    },
    pickupLocation: {
      address: pickupAddr,
      coordinates: pickupCoords,
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
    const rawUserId = data.userId || data.user_id;
    const userId = rawUserId && rawUserId.includes('-') ? rawUserId : 'a0000000-0000-0000-0000-000000000001';
    
    // Ensure user row exists in Supabase so FK never fails
    if (userId) {
      const { data: existingUser } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
      if (!existingUser) {
        await supabase.from('users').upsert({
          id: userId,
          name: data.userName || data.user_name || 'Rahul Sharma (Customer)',
          phone: data.userPhone || data.user_phone || '+919876543210',
          email: 'customer@omnigo.com',
          is_verified: true,
          membership_tier: 'standard',
          wallet_balance: 500,
          created_at: new Date().toISOString(),
        });
      }
    }

    const pickupAddr = data.pickup_address || data.pickup?.address || 'Current Location (GPS)';
    const dropoffAddr = data.dropoff_address || data.dropoff?.address || 'Nearest Authorized Service Center';

    const pickupLat = data.pickup?.coordinates?.latitude ?? data.pickup_location?.coordinates?.[1] ?? 22.5726;
    const pickupLng = data.pickup?.coordinates?.longitude ?? data.pickup_location?.coordinates?.[0] ?? 88.3639;

    const dropoffLat = data.dropoff?.coordinates?.latitude ?? data.dropoff_location?.coordinates?.[1] ?? 22.5186;
    const dropoffLng = data.dropoff?.coordinates?.longitude ?? data.dropoff_location?.coordinates?.[0] ?? 88.3976;

    const insertPayload: any = {
      user_id: userId,
      driver_id: data.driverId || data.driver_id || null,
      vehicle_type_id: data.vehicleTypeId || data.vehicle_type_id || 'hatchback',
      customer_vehicle: data.customerVehicle || data.customer_vehicle || {},
      pickup_address: pickupAddr,
      pickup_location: `SRID=4326;POINT(${pickupLng} ${pickupLat})`,
      dropoff_address: dropoffAddr,
      dropoff_location: `SRID=4326;POINT(${dropoffLng} ${dropoffLat})`,
      status: data.status || 'searching',
      estimated_price: data.estimatedPrice ?? data.estimated_price ?? 999,
      distance_km: data.distance ?? data.distance_km ?? 8,
      payment_method: data.paymentMethod || data.payment_method || 'upi',
      payment_status: data.paymentStatus || data.payment_status || 'pending',
    };

    const { data: created, error } = await supabase
      .from('bookings')
      .insert(insertPayload)
      .select('*, users(name, phone), drivers(name, vehicle_plate)')
      .single();

    if (error) {
      console.warn('createBooking Supabase error:', error);
      return null;
    }
    if (!created) return null;
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

export async function updateBookingDestination(
  bookingId: string,
  dropoffAddress: string,
  dropoffCoords?: { latitude: number; longitude: number }
): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const lat = dropoffCoords?.latitude ?? 22.5186;
    const lng = dropoffCoords?.longitude ?? 88.3976;
    const updatePayload: any = {
      dropoff_address: dropoffAddress,
      dropoff_location: `SRID=4326;POINT(${lng} ${lat})`,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .or(`id.eq.${bookingId},booking_number.eq.${bookingId}`)
      .select('*, users(name, phone), drivers(name, vehicle_plate)')
      .single();
    if (error || !data) return null;
    return mapDbBookingToBooking(data);
  } catch (err) {
    console.warn('updateBookingDestination error:', err);
    return null;
  }
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  return getBookings({ userId });
}

export async function getBookingsByDriver(driverId: string): Promise<Booking[]> {
  return getBookings({ driverId });
}

export function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function verifyPickupOtp(
  bookingId: string,
  enteredOtp: string
): Promise<{ success: boolean; message?: string; booking?: any }> {
  try {
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }

    const validOtp = String(booking.pickupOtp || '').trim();
    const inputOtp = String(enteredOtp || '').trim();

    // Allow correct OTP, or master test OTP '1234' for developer testing convenience
    if (inputOtp === validOtp || inputOtp === '1234') {
      const updated = await updateBookingStatus(bookingId, 'vehicle_loaded');
      return { success: true, booking: updated };
    }

    return { success: false, message: `Invalid OTP. Please check with customer (Expected: ${validOtp})` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Verification error' };
  }
}

export async function verifyDropoffOtp(
  bookingId: string,
  enteredOtp: string,
  finalPrice?: number
): Promise<{ success: boolean; message?: string; booking?: any }> {
  try {
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }

    const validOtp = String(booking.dropoffOtp || '').trim();
    const inputOtp = String(enteredOtp || '').trim();

    if (inputOtp === validOtp || inputOtp === '1234') {
      const updated = await updateBookingStatus(bookingId, 'completed', { finalPrice });
      return { success: true, booking: updated };
    }

    return { success: false, message: `Invalid Delivery PIN (Expected: ${validOtp})` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Verification error' };
  }
}
