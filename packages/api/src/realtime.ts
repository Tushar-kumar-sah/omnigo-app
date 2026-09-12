import { supabase, isSupabaseConfigured } from './supabase';

export function subscribeToBooking(bookingId: string, callback: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };

  let channel: any = null;
  let interval: any = null;

  try {
    channel = supabase
      .channel(`booking-${bookingId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        (payload: any) => {
          callback(payload?.new || payload);
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Realtime booking subscription error:', err);
  }

  // Active polling fallback every 2 seconds
  let lastStatus = '';
  let lastDriverId: any = null;
  interval = setInterval(async () => {
    try {
      const { data } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();
      if (data && (data.status !== lastStatus || data.driver_id !== lastDriverId)) {
        lastStatus = data.status;
        lastDriverId = data.driver_id;
        callback(data);
      }
    } catch (e) {}
  }, 2000);

  return {
    unsubscribe: () => {
      if (channel) supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
    },
  };
}

export function subscribeToIncomingJobs(driverId: string, callback: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };

  let lastNotifiedId = '';
  let channel: any = null;
  let interval: any = null;

  try {
    channel = supabase
      .channel(`incoming-jobs-${driverId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload: any) => {
          const row = payload?.new;
          if (row && (row.status === 'searching' || row.status === 'pending') && (!row.driver_id || row.driver_id === driverId)) {
            if (row.id !== lastNotifiedId) {
              lastNotifiedId = row.id;
              callback(row);
            }
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Realtime subscription error:', err);
  }

  // Active polling fallback: check immediately and every 1.2 seconds
  const checkLatestJob = async () => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .in('status', ['searching', 'pending'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const row = data[0];
        if (row.id !== lastNotifiedId && (!row.driver_id || row.driver_id === driverId)) {
          lastNotifiedId = row.id;
          callback(row);
        }
      }
    } catch (e) {}
  };

  // Immediate check
  checkLatestJob();
  interval = setInterval(checkLatestJob, 1200);

  return {
    unsubscribe: () => {
      if (channel) supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
    },
  };
}

export function subscribeToDriverLocation(driverId: string, callback: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };

  try {
    const channel = supabase
      .channel(`driver-location-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers',
          filter: `id=eq.${driverId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  } catch (err) {
    return { unsubscribe: () => {} };
  }
}

export function subscribeToSOSAlerts(callback: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };

  try {
    const channel = supabase
      .channel('sos-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sos_incidents',
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  } catch (err) {
    return { unsubscribe: () => {} };
  }
}

export function subscribeToNewBookings(callback: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };

  try {
    const channel = supabase
      .channel('new-bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  } catch (err) {
    return { unsubscribe: () => {} };
  }
}

export function subscribeToNotifications(opts: { userId?: string; driverId?: string }, callback: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };

  try {
    const channelName = opts.userId ? `notifs-user-${opts.userId}` : `notifs-driver-${opts.driverId || 'all'}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  } catch (err) {
    return { unsubscribe: () => {} };
  }
}

export function subscribeToAllDrivers(callback: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };

  try {
    const channel = supabase
      .channel('all-drivers-fleet')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivers',
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  } catch (err) {
    return { unsubscribe: () => {} };
  }
}
