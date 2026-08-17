import { supabase, isSupabaseConfigured } from './supabase';

export function subscribeToBooking(bookingId: string, callback: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };

  try {
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
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
    // Fallback polling
    let lastStatus = '';
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();
        if (data && data.status !== lastStatus) {
          lastStatus = data.status;
          callback({ new: data });
        }
      } catch (e) {}
    }, 4000);
    return { unsubscribe: () => clearInterval(interval) };
  }
}

export function subscribeToIncomingJobs(driverId: string, callback: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };

  try {
    const channel = supabase
      .channel(`incoming-jobs-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          if (payload.new && payload.new.status === 'searching') {
            callback(payload);
          }
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
