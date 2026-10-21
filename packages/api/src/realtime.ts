import { supabase, isSupabaseConfigured } from './supabase';
import { mapDbBookingToBooking } from './db/bookings';
import { mapDbDriverToDriver, getDriverById } from './db/drivers';

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
        },
        (payload: any) => {
          const row = payload?.new || payload;
          if (row && (row.id === bookingId || row.booking_number === bookingId)) {
            const mapped = mapDbBookingToBooking(row);
            callback(mapped || row);
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Realtime booking subscription error:', err);
  }

  // Active polling fallback every 1.5 seconds
  let lastStatus = '';
  let lastDriverId: any = null;
  interval = setInterval(async () => {
    try {
      const isUuid = bookingId.includes('-') && bookingId.length > 30;
      let query = supabase.from('bookings').select('*');
      if (isUuid) {
        query = query.eq('id', bookingId);
      } else {
        query = query.or(`id.eq.${bookingId},booking_number.eq.${bookingId}`);
      }
      const { data } = await query.maybeSingle();
      if (data && (data.status !== lastStatus || data.driver_id !== lastDriverId)) {
        lastStatus = data.status;
        lastDriverId = data.driver_id;
        const mapped = mapDbBookingToBooking(data);
        callback(mapped || data);
      }
    } catch (e) {}
  }, 1500);

  return {
    unsubscribe: () => {
      if (channel) supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
    },
  };
}

export interface IncomingJobHandlers {
  onNewJob: (job: any) => void;
  onJobTaken?: (jobId: string, assignedDriverId?: string) => void;
  onJobCancelled?: (jobId: string) => void;
  isJobIgnored?: (jobId: string) => boolean;
}

export function subscribeToIncomingJobs(
  driverId: string,
  handlerOrCallback: IncomingJobHandlers | ((payload: any) => void)
) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {}, clearActiveJob: () => {} };

  const onNewJob = typeof handlerOrCallback === 'function' ? handlerOrCallback : handlerOrCallback.onNewJob;
  const onJobTaken = typeof handlerOrCallback === 'object' ? handlerOrCallback.onJobTaken : undefined;
  const onJobCancelled = typeof handlerOrCallback === 'object' ? handlerOrCallback.onJobCancelled : undefined;
  const isJobIgnored = typeof handlerOrCallback === 'object' ? handlerOrCallback.isJobIgnored : undefined;

  let activeShowingJobId = '';
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
          if (!row || !row.id) return;

          // 1. New or updated order in searching/pending state
          if ((row.status === 'searching' || row.status === 'pending') && (!row.driver_id || row.driver_id === driverId)) {
            if (isJobIgnored && isJobIgnored(row.id)) return;
            activeShowingJobId = row.id;
            onNewJob(row);
            return;
          }

          // 2. Order was accepted by another driver -> Close for all other drivers!
          if (row.id === activeShowingJobId && row.status === 'driver_assigned') {
            if (row.driver_id && row.driver_id !== driverId) {
              const takenId = activeShowingJobId;
              activeShowingJobId = '';
              onJobTaken?.(takenId, row.driver_id);
              return;
            }
          }

          // 3. Order was cancelled
          if (row.id === activeShowingJobId && row.status === 'cancelled') {
            const cancelledId = activeShowingJobId;
            activeShowingJobId = '';
            onJobCancelled?.(cancelledId);
            return;
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Realtime subscription error:', err);
  }

  // Active polling fallback: check every 1.2 seconds
  const checkJobs = async () => {
    try {
      // If currently showing a job, verify if it was taken by someone else
      if (activeShowingJobId) {
        const { data: currentJob } = await supabase
          .from('bookings')
          .select('id, status, driver_id')
          .eq('id', activeShowingJobId)
          .maybeSingle();

        if (currentJob) {
          if (currentJob.status === 'driver_assigned' && currentJob.driver_id && currentJob.driver_id !== driverId) {
            const takenId = activeShowingJobId;
            activeShowingJobId = '';
            onJobTaken?.(takenId, currentJob.driver_id);
            return;
          }
          if (currentJob.status === 'cancelled') {
            const cancelledId = activeShowingJobId;
            activeShowingJobId = '';
            onJobCancelled?.(cancelledId);
            return;
          }
        }
      }

      // If no job currently active, check for the latest unassigned searching job
      if (!activeShowingJobId) {
        const { data: latestJobs } = await supabase
          .from('bookings')
          .select('*')
          .in('status', ['searching', 'pending'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (latestJobs && latestJobs.length > 0) {
          const row = latestJobs[0];
          if (isJobIgnored && isJobIgnored(row.id)) return;
          if (!row.driver_id || row.driver_id === driverId) {
            activeShowingJobId = row.id;
            onNewJob(row);
          }
        }
      }
    } catch (e) {}
  };

  // Immediate check & repeat every 1.2s
  checkJobs();
  interval = setInterval(checkJobs, 1200);

  return {
    unsubscribe: () => {
      if (channel) supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
    },
    clearActiveJob: () => {
      activeShowingJobId = '';
    },
  };
}

export function subscribeToDriverLocation(driverId: string, callback: (payload: any) => void) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };

  let channel: any = null;
  let interval: any = null;

  try {
    channel = supabase
      .channel(`driver-location-${driverId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers',
          filter: `id=eq.${driverId}`,
        },
        (payload) => {
          const raw = payload?.new || payload;
          const mapped = mapDbDriverToDriver(raw);
          if (mapped) callback(mapped);
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Realtime driver location error:', err);
  }

  // Active polling fallback every 1.5 seconds
  let lastLat = 0;
  let lastLng = 0;
  interval = setInterval(async () => {
    try {
      const d = await getDriverById(driverId);
      if (d && (d.latitude !== lastLat || d.longitude !== lastLng)) {
        lastLat = d.latitude;
        lastLng = d.longitude;
        callback(d);
      }
    } catch (e) {}
  }, 1500);

  return {
    unsubscribe: () => {
      if (channel) supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
    },
  };
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
