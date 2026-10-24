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
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId);
      let query = supabase.from('bookings').select('*');
      if (isUuid) {
        query = query.eq('id', bookingId);
      } else {
        query = query.eq('booking_number', bookingId);
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

  // Maximum age for an active searching request to be broadcast to drivers (2 minutes)
  const MAX_JOB_BROADCAST_AGE_MS = 2 * 60 * 1000;

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

          // 1. Only broadcast strictly unassigned jobs in searching/pending state created within the last 2 minutes
          const isSearching = row.status === 'searching' || row.status === 'pending';
          const isUnassigned = !row.driver_id;
          const createdAt = new Date(row.created_at || Date.now()).getTime();
          const isRecent = Date.now() - createdAt <= MAX_JOB_BROADCAST_AGE_MS;

          if (isSearching && isUnassigned && isRecent) {
            if (isJobIgnored && isJobIgnored(row.id)) return;
            activeShowingJobId = row.id;
            onNewJob(row);
            return;
          }

          // 2. Order was accepted by another driver -> Close for all other drivers!
          if (
            (row.id === activeShowingJobId || row.booking_number === activeShowingJobId) &&
            row.driver_id &&
            row.driver_id !== driverId
          ) {
            const takenId = activeShowingJobId;
            activeShowingJobId = '';
            onJobTaken?.(takenId, row.driver_id);
            return;
          }

          // 3. Order was cancelled or completed or claimed
          if (row.id === activeShowingJobId && row.status === 'cancelled') {
            const cancelledId = activeShowingJobId;
            activeShowingJobId = '';
            onJobCancelled?.(cancelledId);
            return;
          }

          if (
            row.id === activeShowingJobId &&
            (row.driver_id === driverId || (row.status !== 'searching' && row.status !== 'pending'))
          ) {
            activeShowingJobId = '';
            return;
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Realtime subscription error:', err);
  }

  // Active polling fallback: check every 1.5 seconds
  const checkJobs = async () => {
    try {
      // If currently showing a job, verify if it was taken by someone else or cancelled
      if (activeShowingJobId) {
        const { data: currentJob } = await supabase
          .from('bookings')
          .select('id, status, driver_id')
          .eq('id', activeShowingJobId)
          .maybeSingle();

        if (currentJob) {
          if (currentJob.driver_id && currentJob.driver_id !== driverId) {
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
          if (
            currentJob.driver_id === driverId ||
            (currentJob.status !== 'searching' && currentJob.status !== 'pending')
          ) {
            activeShowingJobId = '';
            return;
          }
        }
      }

      // If no job currently active, check for the latest strictly UNASSIGNED searching job created within the last 2 minutes
      if (!activeShowingJobId) {
        const twoMinutesAgo = new Date(Date.now() - MAX_JOB_BROADCAST_AGE_MS).toISOString();
        const { data: latestJobs } = await supabase
          .from('bookings')
          .select('*')
          .in('status', ['searching', 'pending'])
          .is('driver_id', null)
          .gte('created_at', twoMinutesAgo)
          .order('created_at', { ascending: false })
          .limit(5);

        if (latestJobs && latestJobs.length > 0) {
          const row = latestJobs.find((j) => {
            if (isJobIgnored && isJobIgnored(j.id)) return false;
            if (j.driver_id) return false;
            const age = Date.now() - new Date(j.created_at).getTime();
            return age <= MAX_JOB_BROADCAST_AGE_MS;
          });
          if (row) {
            activeShowingJobId = row.id;
            onNewJob(row);
          }
        }
      }
    } catch (e) {}
  };

  // Immediate check & repeat every 1.5s
  checkJobs();
  interval = setInterval(checkJobs, 1500);

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
