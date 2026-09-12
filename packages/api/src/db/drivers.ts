import { supabase, isSupabaseConfigured } from '../supabase';
import type { Driver, DriverEarnings } from '../types';

export function mapDbDriverToDriver(dbDriver: any): any {
  if (!dbDriver) return null;
  const docsMap: any = {};

  if (Array.isArray(dbDriver.docs)) {
    dbDriver.docs.forEach((d: any) => {
      const key = d.doc_type === 'police_verification' ? 'police' : (d.doc_type === 'truck_inspection' ? 'truckInspection' : d.doc_type);
      docsMap[key] = {
        name: d.doc_name || d.doc_type,
        status: d.status ? (d.status.charAt(0).toUpperCase() + d.status.slice(1)) : 'Pending',
        docNumber: d.doc_number || '—',
      };
    });
  }

  const kycStatusMap: Record<string, string> = {
    verified: 'Verified',
    pending_review: 'Pending Review',
    action_required: 'Action Required',
    suspended: 'Suspended',
  };

  const plate = dbDriver.vehicle_plate || dbDriver.vehicle_number || '—';

  let lat = 22.5726;
  let lng = 88.3639;

  if (dbDriver.latitude != null && dbDriver.longitude != null) {
    lat = Number(dbDriver.latitude);
    lng = Number(dbDriver.longitude);
  } else if (dbDriver.location && typeof dbDriver.location === 'object' && Array.isArray(dbDriver.location.coordinates)) {
    lng = Number(dbDriver.location.coordinates[0]);
    lat = Number(dbDriver.location.coordinates[1]);
  } else if (typeof dbDriver.location === 'string') {
    const match = dbDriver.location.match(/POINT\(([^ ]+)\s+([^)]+)\)/i);
    if (match) {
      lng = parseFloat(match[1]);
      lat = parseFloat(match[2]);
    } else if (dbDriver.location.length >= 42 && /^[0-9a-fA-F]+$/.test(dbDriver.location)) {
      try {
        const buf = Buffer.from(dbDriver.location, 'hex');
        const isLE = buf[0] === 1;
        const type = isLE ? buf.readUInt32LE(1) : buf.readUInt32BE(1);
        const hasSrid = (type & 0x20000000) !== 0;
        const offset = hasSrid ? 9 : 5;
        lng = isLE ? buf.readDoubleLE(offset) : buf.readDoubleBE(offset);
        lat = isLE ? buf.readDoubleLE(offset + 8) : buf.readDoubleBE(offset + 8);
      } catch (e) {}
    }
  }

  const status = dbDriver.is_online
    ? (dbDriver.current_job_status === 'towing' ? 'towing' : dbDriver.current_job_status === 'en_route' ? 'en_route' : 'available')
    : 'offline';

  return {
    id: dbDriver.id || '—',
    uuid: dbDriver.id,
    name: dbDriver.name || '—',
    phone: dbDriver.phone || '—',
    email: dbDriver.email || '—',
    avatar: dbDriver.avatar,
    rating: Number(dbDriver.rating || 0),
    totalTrips: dbDriver.total_trips || 0,
    acceptanceRate: `${dbDriver.acceptance_rate || 0}%`,
    onlineHours: dbDriver.online_hours || '0 hrs',
    isOnline: Boolean(dbDriver.is_online),
    isVerified: Boolean(dbDriver.is_verified),
    status: status,
    kycStatus: kycStatusMap[dbDriver.kyc_status] || 'Pending',
    vehicleType: dbDriver.vehicle_type || 'Tow Truck',
    vehicleNumber: plate,
    vehiclePlate: plate,
    licensePlate: plate,
    location: {
      latitude: lat,
      longitude: lng,
      lat,
      lng,
    },
    latitude: lat,
    longitude: lng,
    speed: typeof dbDriver.speed === 'number' ? `${Math.round(dbDriver.speed)} km/h` : (dbDriver.speed || '0 km/h'),
    heading: Number(dbDriver.heading || 0),
    city: dbDriver.city || '—',
    address: dbDriver.address || '—',
    bankName: dbDriver.bank_name || '—',
    bankAccount: dbDriver.bank_account_number || '—',
    ifsc: dbDriver.bank_ifsc || '—',
    documents: docsMap,
    earnings: dbDriver.earnings_data || { today: 0, thisWeek: 0, thisMonth: 0, total: 0 },
    createdAt: dbDriver.created_at || new Date().toISOString(),
  };
}

export async function getDrivers(): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapDbDriverToDriver);
  } catch (err) {
    console.warn('getDrivers error:', err);
    return [];
  }
}

export async function getDriverById(id: string): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapDbDriverToDriver(data);
  } catch (err) {
    return null;
  }
}

export async function getNearbyDrivers(lat: number, lng: number, radiusKm: number = 10): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('is_online', true);

    if (error || !data) return [];
    return data.map(mapDbDriverToDriver);
  } catch (err) {
    return [];
  }
}

export async function updateDriverLocation(id: string, lat: number, lng: number, heading?: number, speed?: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const payload: any = {
      location: `POINT(${lng} ${lat})`,
      is_online: true,
      updated_at: new Date().toISOString(),
    };
    if (heading !== undefined) payload.heading = heading;
    if (speed !== undefined) payload.speed = speed;

    const { data: existing } = await supabase.from('drivers').select('id').eq('id', id).maybeSingle();
    if (!existing) {
      await supabase.from('drivers').upsert({
        id,
        name: 'OmniGo Partner (Live Driver)',
        phone: '+919876543210',
        rating: 4.9,
        total_trips: 45,
        is_online: true,
        is_verified: true,
        kyc_status: 'verified',
        vehicle_type: 'flatbed',
        vehicle_plate: 'MH 12 AB 1234',
        vehicle_number: 'MH 12 AB 1234',
        ...payload,
      });
    } else {
      await supabase.from('drivers').update(payload).eq('id', id);
    }
  } catch (err) {
    console.warn('updateDriverLocation error:', err);
  }
}

export async function updateDriver(id: string, data: any): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.email !== undefined) payload.email = data.email;
    if (data.kycStatus !== undefined) payload.kyc_status = data.kycStatus.toLowerCase().replace(/\s+/g, '_');
    if (data.isVerified !== undefined) payload.is_verified = data.isVerified;
    if (data.kycStatus === 'Verified' || data.kycStatus === 'verified') payload.is_verified = true;
    if (data.isOnline !== undefined) payload.is_online = data.isOnline;
    if (data.rating !== undefined) payload.rating = data.rating;
    if (data.walletBalance !== undefined) payload.wallet_balance = data.walletBalance;

    const { data: updated, error } = await supabase
      .from('drivers')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return updated ? mapDbDriverToDriver(updated) : null;
  } catch (err) {
    console.warn('updateDriver error:', err);
    return null;
  }
}

export async function toggleDriverOnline(id: string, isOnline: boolean): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { data: existing } = await supabase.from('drivers').select('id').eq('id', id).maybeSingle();
    if (!existing) {
      await supabase.from('drivers').upsert({
        id,
        name: 'OmniGo Partner (Live Driver)',
        phone: '+919876543210',
        rating: 4.9,
        total_trips: 45,
        is_online: isOnline,
        is_verified: true,
        kyc_status: 'verified',
        vehicle_type: 'flatbed',
        vehicle_plate: 'MH 12 AB 1234',
        vehicle_number: 'MH 12 AB 1234',
        updated_at: new Date().toISOString(),
      });
    } else {
      await supabase.from('drivers').update({ is_online: isOnline, updated_at: new Date().toISOString() }).eq('id', id);
    }
  } catch (err) {
    console.warn('toggleDriverOnline error:', err);
  }
}

export async function getDriverEarnings(driverId: string): Promise<DriverEarnings> {
  const empty = { today: 0, thisWeek: 0, thisMonth: 0, total: 0 };
  if (!isSupabaseConfigured || !supabase) return empty;
  try {
    const { data, error } = await supabase
      .from('driver_earnings')
      .select('*')
      .eq('driver_id', driverId)
      .maybeSingle();

    if (error || !data) return empty;
    return {
      today: Number(data.today || 0),
      thisWeek: Number(data.this_week || 0),
      thisMonth: Number(data.this_month || 0),
      total: Number(data.total || 0),
    };
  } catch (err) {
    return empty;
  }
}

export async function getDriverDocuments(driverId: string): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('driver_documents')
      .select('*')
      .eq('driver_id', driverId);

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}
