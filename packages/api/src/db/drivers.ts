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
        const bytes = new Uint8Array(dbDriver.location.length / 2);
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = parseInt(dbDriver.location.substr(i * 2, 2), 16);
        }
        const view = new DataView(bytes.buffer);
        const isLE = view.getUint8(0) === 1;
        const type = view.getUint32(1, isLE);
        const hasSrid = (type & 0x20000000) !== 0;
        const offset = hasSrid ? 9 : 5;
        const parsedLng = view.getFloat64(offset, isLE);
        const parsedLat = view.getFloat64(offset + 8, isLE);
        if (!isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat !== 0 && parsedLng !== 0) {
          lng = parsedLng;
          lat = parsedLat;
        }
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
    rating: dbDriver.rating != null ? Number(dbDriver.rating) : 0,
    hasRatings: dbDriver.rating != null && Number(dbDriver.rating) > 0,
    reviewCount: dbDriver.review_count !== undefined ? Number(dbDriver.review_count) : (dbDriver.rating && Number(dbDriver.rating) > 0 ? 1 : 0),
    totalTrips: dbDriver.total_trips || 0,
    acceptanceRate: `${dbDriver.acceptance_rate || 0}%`,
    onlineHours: dbDriver.online_hours || '0 hrs',
    isOnline: Boolean(dbDriver.is_online),
    isVerified: Boolean(dbDriver.is_verified),
    status: status,
    kycStatus: kycStatusMap[dbDriver.kyc_status] || 'Pending',
    vehicleType: dbDriver.vehicle_type || 'Tow Truck',
    vehicle: `${dbDriver.vehicle_type || 'Tow Truck'} • ${plate}`,
    eta: '5-8 mins',
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

    // Fetch real ratings from completed bookings for this driver
    const { data: ratedBookings } = await supabase
      .from('bookings')
      .select('driver_rating')
      .eq('driver_id', id)
      .not('driver_rating', 'is', null);

    const reviewCount = ratedBookings?.length || 0;
    let avgRating = 0;
    let hasRatings = false;

    if (reviewCount > 0) {
      const sum = ratedBookings!.reduce((acc: number, b: any) => acc + Number(b.driver_rating || 0), 0);
      avgRating = Math.round((sum / reviewCount) * 10) / 10;
      hasRatings = true;
    }

    const mapped = mapDbDriverToDriver(data);
    mapped.rating = hasRatings ? avgRating : 0;
    mapped.hasRatings = hasRatings;
    mapped.reviewCount = reviewCount;

    // Attach real driver earnings and wallet balance
    try {
      const earnings = await getDriverEarnings(id);
      mapped.earnings = earnings;
      mapped.wallet = {
        balance: earnings.total,
        pendingBalance: 0,
      };
    } catch (_) {}

    return mapped;
  } catch (err) {
    return null;
  }
}

export async function rateDriverBooking(
  bookingId: string,
  rating: number,
  feedbackNotes?: string
): Promise<{ success: boolean; averageRating?: number; reviewCount?: number }> {
  if (!isSupabaseConfigured || !supabase) return { success: false };
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId);
    let query = supabase.from('bookings').select('id, driver_id, status');
    if (isUuid) {
      query = query.eq('id', bookingId);
    } else {
      query = query.eq('booking_number', bookingId);
    }

    const { data: booking, error: bErr } = await query.maybeSingle();
    if (bErr || !booking) {
      console.warn('rateDriverBooking: booking not found', bookingId);
      return { success: false };
    }

    // 1. Update booking row with driver_rating
    const updatePayload: any = {
      driver_rating: rating,
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', booking.id);

    const driverId = booking.driver_id;
    if (!driverId) {
      return { success: true, averageRating: rating, reviewCount: 1 };
    }

    // 2. Fetch all ratings for this driver to compute real mathematical average
    const { data: allRatings } = await supabase
      .from('bookings')
      .select('driver_rating')
      .eq('driver_id', driverId)
      .not('driver_rating', 'is', null);

    const reviewCount = allRatings?.length || 1;
    const sum = (allRatings || [{ driver_rating: rating }]).reduce(
      (acc: number, r: any) => acc + Number(r.driver_rating || 0),
      0
    );
    const avg = Math.round((sum / reviewCount) * 10) / 10;

    // 3. Update driver row in Supabase with new real average
    await supabase
      .from('drivers')
      .update({
        rating: avg,
        updated_at: new Date().toISOString(),
      })
      .eq('id', driverId);

    return { success: true, averageRating: avg, reviewCount };
  } catch (err) {
    console.warn('rateDriverBooking error:', err);
    return { success: false };
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
        phone: '+91' + id.replace(/-/g, '').slice(0, 10),
        rating: null,
        total_trips: 0,
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
        phone: '+91' + id.replace(/-/g, '').slice(0, 10),
        rating: null,
        total_trips: 0,
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

export async function syncDriverEarnings(driverId: string): Promise<DriverEarnings> {
  const empty: DriverEarnings = { today: 0, thisWeek: 0, thisMonth: 0, total: 0 };
  if (!isSupabaseConfigured || !supabase || !driverId) return empty;

  try {
    // 1. Fetch completed bookings for this driver
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, final_price, estimated_price, status, completed_at, updated_at, created_at')
      .eq('driver_id', driverId)
      .in('status', ['completed', 'vehicle_delivered']);

    // 2. Fetch ledger entries for this driver
    const { data: ledgerEntries } = await supabase
      .from('ledger_entries')
      .select('booking_id, driver_net_earning, gross_customer_fare, commission_amount, customer_tip, created_at')
      .eq('driver_id', driverId);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let today = 0;
    let thisWeek = 0;
    let thisMonth = 0;
    let total = 0;

    const countedBookingIds = new Set<string>();

    // Priority 1: Aggregate from ledger entries (official financial records)
    (ledgerEntries || []).forEach((le: any) => {
      if (le.booking_id) countedBookingIds.add(le.booking_id);
      const net = Number(le.driver_net_earning || 0);
      const time = new Date(le.created_at || now).getTime();

      total += net;
      if (time >= startOfMonth) thisMonth += net;
      if (time >= startOfWeek) thisWeek += net;
      if (time >= startOfToday || (now.getTime() - time) < 24 * 3600 * 1000) today += net;
    });

    // Priority 2: Also include completed bookings that don't have a ledger entry yet
    (bookings || []).forEach((b: any) => {
      if (!countedBookingIds.has(b.id)) {
        const gross = Number(b.final_price || b.estimated_price || 0);
        const net = Math.round(gross * 0.90); // 10% platform fee deducted
        const time = new Date(b.completed_at || b.updated_at || b.created_at || now).getTime();

        total += net;
        if (time >= startOfMonth) thisMonth += net;
        if (time >= startOfWeek) thisWeek += net;
        if (time >= startOfToday || (now.getTime() - time) < 24 * 3600 * 1000) today += net;
      }
    });

    const result: DriverEarnings = {
      today: Math.round(today),
      thisWeek: Math.round(thisWeek),
      thisMonth: Math.round(thisMonth),
      total: Math.round(total),
    };

    // 3. Upsert to driver_earnings table in Supabase
    try {
      await supabase.from('driver_earnings').upsert({
        driver_id: driverId,
        today: result.today,
        this_week: result.thisWeek,
        this_month: result.thisMonth,
        total: result.total,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'driver_id' });
    } catch (uErr) {
      console.warn('upsert driver_earnings error:', uErr);
    }

    return result;
  } catch (err) {
    console.warn('syncDriverEarnings error:', err);
    return empty;
  }
}

export async function getDriverEarnings(driverId: string): Promise<DriverEarnings> {
  const empty: DriverEarnings = { today: 0, thisWeek: 0, thisMonth: 0, total: 0 };
  if (!isSupabaseConfigured || !supabase || !driverId) return empty;
  try {
    // 1. Fetch current row
    const { data, error } = await supabase
      .from('driver_earnings')
      .select('*')
      .eq('driver_id', driverId)
      .maybeSingle();

    if (!error && data && Number(data.total || 0) > 0) {
      // Re-sync asynchronously in background to ensure zero staleness
      syncDriverEarnings(driverId).catch(() => {});
      return {
        today: Number(data.today || 0),
        thisWeek: Number(data.this_week || 0),
        thisMonth: Number(data.this_month || 0),
        total: Number(data.total || 0),
      };
    }

    // 2. If row doesn't exist or is 0, compute immediately from completed trips
    return await syncDriverEarnings(driverId);
  } catch (err) {
    return empty;
  }
}

export async function getDriverWalletTransactions(driverId: string): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase || !driverId) return [];
  try {
    const { data: wtData } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    const { data: ledgerData } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    const seenBookingIds = new Set<string>();
    const transactions: any[] = [];

    (wtData || []).forEach((t: any) => {
      if (t.booking_id) seenBookingIds.add(t.booking_id);
      transactions.push({
        id: t.id,
        booking_id: t.booking_id,
        type: t.type,
        amount: Number(t.amount || 0),
        description: t.description || (t.type === 'credit' ? 'Trip Earnings' : 'Payout'),
        created_at: t.created_at,
        isCredit: t.type === 'credit',
        reference: t.payment_id || t.settlement_id || t.utr_number || '',
      });
    });

    (ledgerData || []).forEach((le: any) => {
      if (!seenBookingIds.has(le.booking_id)) {
        const net = Number(le.driver_net_earning || le.gross_customer_fare || 0);
        transactions.push({
          id: le.id,
          booking_id: le.booking_id,
          type: 'credit',
          amount: net,
          commission_amount: Number(le.commission_amount || 0),
          fare_amount: Number(le.gross_customer_fare || 0),
          description: `Trip Earnings - ${le.ledger_number || (le.booking_id ? le.booking_id.slice(0, 8) : 'Trip')}`,
          created_at: le.created_at,
          isCredit: true,
          reference: le.payment_id || le.ledger_number || '',
        });
      }
    });

    transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return transactions;
  } catch (err) {
    console.warn('getDriverWalletTransactions error:', err);
    return [];
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

export async function createDriver(data: any): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const fallbackPhone = '+919' + String(Math.floor(100000000 + Math.random() * 900000000));
    const payload: any = {
      name: data.name || 'OmniGo Driver Partner',
      phone: data.phone || fallbackPhone,
      email: data.email || null,
      avatar: data.avatar || null,
      rating: data.rating !== undefined ? data.rating : null,
      total_trips: data.totalTrips || 0,
      acceptance_rate: 100,
      cancellation_rate: 0,
      online_hours: '0 hrs',
      is_online: Boolean(data.isOnline ?? false),
      is_verified: Boolean(data.isVerified ?? false),
      kyc_status: data.kycStatus ? data.kycStatus.toLowerCase().replace(/\s+/g, '_') : 'pending_review',
      vehicle_type: data.vehicleType || 'flatbed',
      vehicle_number: data.vehicleNumber || data.vehiclePlate || 'MH 12 AB 1234',
      vehicle_plate: data.vehiclePlate || data.vehicleNumber || 'MH 12 AB 1234',
      location: data.latitude && data.longitude ? `POINT(${data.longitude} ${data.latitude})` : 'POINT(88.3639 22.5726)',
      city: data.city || 'Kolkata',
      address: data.address || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('drivers')
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('createDriver error:', error);
      return null;
    }
    return created ? mapDbDriverToDriver(created) : null;
  } catch (err) {
    console.warn('createDriver error:', err);
    return null;
  }
}

