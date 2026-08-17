/**
 * OmniGo User App — Database & API Client
 * Connects directly to Supabase via @omnigo/api
 */

import {
  getUserById,
  getUsers,
  getBookingsByUser,
  getBookingById,
  createBooking,
  updateBookingStatus,
  getDriverById,
  getUserWalletTransactions,
  getNotifications,
  markNotificationAsRead as apiMarkRead,
  markAllNotificationsAsRead as apiMarkAllRead,
  deleteNotification as apiDeleteNotification,
  createSOSIncident,
  getVehicleTypes,
} from '@omnigo/api';

// ─── User ─────────────────────────────────────────────────────

export async function fetchCurrentUser(): Promise<any> {
  try {
    const users = await getUsers();
    return users.length > 0 ? users[0] : null;
  } catch (e) {
    console.warn('[api] fetchCurrentUser failed', e);
    return null;
  }
}

export async function fetchUserById(id: string): Promise<any> {
  try {
    return await getUserById(id);
  } catch (e) {
    console.warn('[api] fetchUserById failed', e);
    return null;
  }
}

export async function fetchUserBookings(userId: string): Promise<any[]> {
  try {
    return await getBookingsByUser(userId);
  } catch (e) {
    console.warn('[api] fetchUserBookings failed', e);
    return [];
  }
}

export async function fetchUserWallet(userId: string): Promise<{ balance: number; transactions: any[] }> {
  try {
    const [user, transactions] = await Promise.all([
      getUserById(userId),
      getUserWalletTransactions(userId),
    ]);
    return {
      balance: user?.walletBalance ?? 0,
      transactions: transactions ?? [],
    };
  } catch (e) {
    console.warn('[api] fetchUserWallet failed', e);
    return { balance: 0, transactions: [] };
  }
}

// ─── Bookings ─────────────────────────────────────────────────

export async function fetchBookingById(id: string): Promise<any | null> {
  try {
    return await getBookingById(id);
  } catch (e) {
    console.warn('[api] fetchBookingById failed', e);
    return null;
  }
}

export async function createNewBooking(bookingData: {
  userId: string;
  vehicleTypeId: string;
  customerVehicle: any;
  pickup: { address: string; coordinates: { latitude: number; longitude: number } };
  dropoff: { address: string; coordinates: { latitude: number; longitude: number } };
  estimatedPrice: number;
  distance: number;
  paymentMethod: string;
}): Promise<any | null> {
  try {
    return await createBooking({
      user_id: bookingData.userId,
      vehicle_type_id: bookingData.vehicleTypeId,
      customer_vehicle: bookingData.customerVehicle,
      pickup_address: bookingData.pickup.address,
      pickup_location: {
        type: 'Point',
        coordinates: [bookingData.pickup.coordinates.longitude, bookingData.pickup.coordinates.latitude],
      },
      dropoff_address: bookingData.dropoff.address,
      dropoff_location: {
        type: 'Point',
        coordinates: [bookingData.dropoff.coordinates.longitude, bookingData.dropoff.coordinates.latitude],
      },
      estimated_price: bookingData.estimatedPrice,
      distance_km: bookingData.distance,
      payment_method: bookingData.paymentMethod as any,
    });
  } catch (e) {
    console.warn('[api] createNewBooking failed', e);
    return null;
  }
}

export async function updateBookingStatusApi(id: string, status: string): Promise<any | null> {
  try {
    return await updateBookingStatus(id, status as any);
  } catch (e) {
    console.warn('[api] updateBookingStatusApi failed', e);
    return null;
  }
}

// ─── Drivers ──────────────────────────────────────────────────

export async function fetchDriverById(id: string): Promise<any> {
  try {
    return await getDriverById(id);
  } catch (e) {
    console.warn('[api] fetchDriverById failed', e);
    return null;
  }
}

// ─── Notifications ────────────────────────────────────────────

export async function fetchNotifications(userId?: string): Promise<any[]> {
  try {
    if (!userId) return [];
    return await getNotifications({ userId });
  } catch (e) {
    console.warn('[api] fetchNotifications failed', e);
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<boolean> {
  try {
    await apiMarkRead(id);
    return true;
  } catch (e) {
    console.warn('[api] markNotificationRead failed', e);
    return false;
  }
}

export async function markAllNotificationsRead(userId?: string): Promise<boolean> {
  try {
    if (!userId) return false;
    await apiMarkAllRead({ userId });
    return true;
  } catch (e) {
    console.warn('[api] markAllNotificationsRead failed', e);
    return false;
  }
}

export async function deleteNotificationApi(id: string): Promise<boolean> {
  try {
    await apiDeleteNotification(id);
    return true;
  } catch (e) {
    console.warn('[api] deleteNotificationApi failed', e);
    return false;
  }
}

// ─── SOS ──────────────────────────────────────────────────────

export async function createSOSAlert(data: {
  userId?: string;
  userName: string;
  userPhone: string;
  locationAddress: string;
  latitude: number;
  longitude: number;
  emergencyType: string;
}): Promise<any> {
  try {
    return await createSOSIncident({
      user_id: data.userId,
      customer_name: data.userName,
      customer_phone: data.userPhone,
      location_address: data.locationAddress,
      gps_display: `${data.latitude.toFixed(4)}° N, ${data.longitude.toFixed(4)}° E`,
      hazard_type: data.emergencyType,
      location_coords: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude],
      },
    });
  } catch (e) {
    console.warn('[api] createSOSAlert failed', e);
    return null;
  }
}

// ─── Vehicle Types ────────────────────────────────────────────

export async function fetchVehicleTypes(): Promise<any[]> {
  try {
    return await getVehicleTypes();
  } catch (e) {
    console.warn('[api] fetchVehicleTypes failed', e);
    return [];
  }
}
