import { supabase, isSupabaseConfigured } from '../supabase';
import { syncDriverEarnings } from './drivers';

export async function createLedgerEntry(data: any): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const grossFare = Number(data.grossCustomerFare ?? data.amount ?? data.totalAmount ?? 0);
    const commissionRate = Number(data.commissionRate ?? 0.10);
    const commissionAmount = Number(data.commissionAmount ?? Math.round(grossFare * commissionRate));
    const driverGross = Number(data.driverGrossEarning ?? grossFare);
    const tip = Number(data.customerTip ?? 0);
    const driverNet = Number(data.driverNetEarning ?? (driverGross - commissionAmount + tip));

    const insertPayload: any = {
      ledger_number: data.ledgerNumber || `LDG-${Date.now()}`,
      booking_id: data.bookingId || null,
      payment_id: data.paymentId || `PAY-${Date.now()}`,
      driver_id: data.driverId || null,
      driver_name: data.driverName || '—',
      gross_customer_fare: grossFare,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      gst_on_commission: data.gstOnCommission || 0,
      driver_gross_earning: driverGross,
      customer_tip: tip,
      driver_net_earning: driverNet,
      settlement_status: data.settlementStatus || 'unsettled',
    };

    const { data: created, error } = await supabase
      .from('ledger_entries')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !created) {
      console.warn('createLedgerEntry insert error:', error);
      return null;
    }

    // 1. Create wallet credit record for driver
    if (insertPayload.driver_id && driverNet > 0) {
      try {
        await supabase.from('wallet_transactions').insert({
          driver_id: insertPayload.driver_id,
          type: 'credit',
          amount: driverNet,
          description: data.description || `Trip Earnings - ${insertPayload.booking_id || insertPayload.ledger_number}`,
          booking_id: insertPayload.booking_id,
          payment_id: insertPayload.payment_id,
          created_at: new Date().toISOString(),
        });
      } catch (wErr) {
        console.warn('wallet_transactions credit insert error:', wErr);
      }

      // 2. Real-time sync of driver_earnings table
      try {
        await syncDriverEarnings(insertPayload.driver_id);
      } catch (sErr) {
        console.warn('syncDriverEarnings error:', sErr);
      }
    }

    return created;
  } catch (err) {
    console.warn('createLedgerEntry error:', err);
    return null;
  }
}

export async function getLedgerByBooking(bookingId: string): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export async function getDriverLedger(driverId: string): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function getAllLedgerEntries(): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function createSettlement(data: any): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const insertPayload: any = {
      settlement_number: data.settlementNumber || `SET-${Date.now()}`,
      driver_id: data.driverId || null,
      driver_name: data.driverName || '—',
      booking_ids: data.bookingIds || [],
      gross_amount: data.grossAmount || 0,
      total_commission_deducted: data.totalCommissionDeducted || 0,
      net_payable: data.netPayable || 0,
      status: data.status || 'pending_clearance',
    };

    const { data: created, error } = await supabase
      .from('settlements')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !created) return null;

    // Record wallet debit for payout
    if (insertPayload.driver_id && Number(insertPayload.net_payable || 0) > 0) {
      try {
        await supabase.from('wallet_transactions').insert({
          driver_id: insertPayload.driver_id,
          type: 'debit',
          amount: Number(insertPayload.net_payable),
          description: `Bank Payout (${insertPayload.settlement_number})`,
          settlement_id: insertPayload.settlement_number,
          created_at: new Date().toISOString(),
        });
      } catch (wErr) {
        console.warn('wallet_transactions debit insert error:', wErr);
      }
    }

    return created;
  } catch (err) {
    return null;
  }
}

export async function getSettlements(driverId?: string): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let query = supabase.from('settlements').select('*').order('created_at', { ascending: false });
    if (driverId) query = query.eq('driver_id', driverId);

    const { data, error } = await query;
    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function getPayouts(driverId?: string): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let query = supabase.from('payouts').select('*').order('created_at', { ascending: false });
    if (driverId) query = query.eq('driver_id', driverId);

    const { data, error } = await query;
    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function getAdminRevenueSummary(): Promise<any> {
  const empty = { totalGMV: 0, omniGoRevenue: 0, driverPayouts: 0, pendingEscrow: 0 };
  if (!isSupabaseConfigured || !supabase) return empty;
  try {
    const { data, error } = await supabase.from('ledger_entries').select('*');
    if (error || !data || data.length === 0) return empty;

    let totalGmv = 0;
    let omnigoRevenue = 0;
    let driverPayouts = 0;
    let pendingEscrow = 0;

    data.forEach((row: any) => {
      totalGmv += Number(row.gross_customer_fare || 0);
      omnigoRevenue += Number(row.commission_amount || 0);
      driverPayouts += Number(row.driver_net_earning || 0);
      if (row.settlement_status === 'unsettled') {
        pendingEscrow += Number(row.driver_net_earning || 0);
      }
    });

    return { totalGMV: totalGmv, omniGoRevenue: omnigoRevenue, driverPayouts, pendingEscrow };
  } catch (err) {
    return empty;
  }
}

export async function getAuditTrails(): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*, bookings(booking_number, pickup_address, dropoff_address, users(name))')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return [];

    return data.map((le: any) => {
      const b = le.bookings || {};
      const u = b.users || {};
      return {
        ledgerNumber: le.ledger_number,
        bookingId: b.booking_number || '—',
        customerName: u.name || '—',
        paymentId: le.payment_id || '—',
        gatewayMethod: 'UPI (Escrow)',
        customerPaid: `₹${le.gross_customer_fare || 0}`,
        omniGoTake: `₹${le.commission_amount || 0}`,
        partnerPayable: `₹${le.driver_net_earning || 0}`,
        payoutStatus: le.settlement_status === 'settled' ? 'Settled & Paid' : 'Pending Clearance',
        utrNumber: '—',
        date: le.created_at ? new Date(le.created_at).toLocaleString('en-IN') : '—',
        route: `${b.pickup_address || '—'} ➔ ${b.dropoff_address || '—'}`,
      };
    });
  } catch (err) {
    console.warn('getAuditTrails error:', err);
    return [];
  }
}
