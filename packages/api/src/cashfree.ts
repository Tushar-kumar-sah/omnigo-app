/**
 * OmniGo Cashfree Payment Gateway Client & Integration
 * 
 * Supports Sandbox/Test and Production Cashfree PG v2023-08-01 APIs.
 * AppID: TEST11272826a27c495faa36a2d5746f62827211
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface CashfreeConfig {
  appId: string;
  secretKey: string;
  env: 'TEST' | 'PROD';
  apiVersion: string;
  baseUrl: string;
}

export const CASHFREE_CONFIG: CashfreeConfig = {
  appId:
    (typeof process !== 'undefined' && (process.env?.CASHFREE_APP_ID || process.env?.EXPO_PUBLIC_CASHFREE_APP_ID)) ||
    'TEST11272826a27c495faa36a2d5746f62827211',
  secretKey:
    (typeof process !== 'undefined' && (process.env?.CASHFREE_SECRET_KEY || process.env?.EXPO_PUBLIC_CASHFREE_SECRET_KEY)) ||
    '',
  env:
    ((typeof process !== 'undefined' && (process.env?.CASHFREE_ENV || process.env?.EXPO_PUBLIC_CASHFREE_ENV)) as any) ||
    'TEST',
  apiVersion: '2023-08-01',
  baseUrl: 'https://sandbox.cashfree.com/pg',
};

export interface CreateOrderParams {
  orderId?: string;
  orderAmount: number;
  orderCurrency?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  returnUrl?: string;
  notifyUrl?: string;
  orderNote?: string;
}

export interface CashfreeOrderResponse {
  success: boolean;
  orderId: string;
  cfOrderId?: string;
  paymentSessionId?: string;
  orderStatus?: string;
  orderAmount?: number;
  paymentUrl?: string;
  error?: string;
  raw?: any;
}

export interface CashfreeVerificationResponse {
  success: boolean;
  isPaid: boolean;
  orderStatus: string;
  orderAmount?: number;
  orderCurrency?: string;
  paymentDetails?: any;
  error?: string;
}

/**
 * Creates a Cashfree PG Order
 */
export async function createCashfreeOrder(params: CreateOrderParams): Promise<CashfreeOrderResponse> {
  try {
    const rawOrderId = params.orderId || `omni_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    // Cashfree order_id allows alphanumeric, hyphens and underscores (up to 45 chars)
    const sanitizedOrderId = rawOrderId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);

    // Sanitize phone (Indian 10-digit without country code prefix)
    let cleanPhone = (params.customerPhone || '9876543210').replace(/[^0-9]/g, '');
    if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.slice(2);
    }
    if (cleanPhone.length < 10) {
      cleanPhone = '9876543210';
    }

    const payload = {
      order_id: sanitizedOrderId,
      order_amount: Math.max(1, Math.round(params.orderAmount * 100) / 100),
      order_currency: params.orderCurrency || 'INR',
      customer_details: {
        customer_id: params.customerId ? params.customerId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45) : 'cust_' + Date.now(),
        customer_name: params.customerName || 'OmniGo Customer',
        customer_email: params.customerEmail || 'support@omnigo.in',
        customer_phone: cleanPhone,
      },
      order_meta: {
        return_url: params.returnUrl || `https://omnigo.in/payment/cashfree-return?order_id=${sanitizedOrderId}`,
        notify_url: params.notifyUrl || undefined,
      },
      order_note: params.orderNote || 'OmniGo Emergency Towing Service',
    };

    const response = await fetch(`${CASHFREE_CONFIG.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': CASHFREE_CONFIG.appId,
        'x-client-secret': CASHFREE_CONFIG.secretKey,
        'x-api-version': CASHFREE_CONFIG.apiVersion,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('[Cashfree] createOrder error:', data);
      return {
        success: false,
        orderId: sanitizedOrderId,
        error: data.message || 'Failed to initialize Cashfree order',
        raw: data,
      };
    }

    return {
      success: true,
      orderId: data.order_id,
      cfOrderId: data.cf_order_id,
      paymentSessionId: data.payment_session_id,
      orderStatus: data.order_status,
      orderAmount: data.order_amount,
      paymentUrl: `https://sandbox.cashfree.com/pg/orders/${data.order_id}`,
      raw: data,
    };
  } catch (err: any) {
    console.warn('[Cashfree] createOrder network error:', err);
    return {
      success: false,
      orderId: params.orderId || '',
      error: err?.message || 'Network error connecting to Cashfree PG',
    };
  }
}

/**
 * Fetches order details and verifies payment state from Cashfree
 */
export async function verifyCashfreePayment(orderId: string): Promise<CashfreeVerificationResponse> {
  try {
    const cleanOrderId = orderId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);

    const response = await fetch(`${CASHFREE_CONFIG.baseUrl}/orders/${cleanOrderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_CONFIG.appId,
        'x-client-secret': CASHFREE_CONFIG.secretKey,
        'x-api-version': CASHFREE_CONFIG.apiVersion,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('[Cashfree] verifyPayment error:', data);
      return {
        success: false,
        isPaid: false,
        orderStatus: data.order_status || 'UNKNOWN',
        error: data.message || 'Failed to verify Cashfree order status',
      };
    }

    const isPaid = data.order_status === 'PAID';

    return {
      success: true,
      isPaid,
      orderStatus: data.order_status,
      orderAmount: data.order_amount,
      orderCurrency: data.order_currency,
      paymentDetails: data,
    };
  } catch (err: any) {
    console.warn('[Cashfree] verifyPayment network error:', err);
    return {
      success: false,
      isPaid: false,
      orderStatus: 'NETWORK_ERROR',
      error: err?.message || 'Error checking payment status',
    };
  }
}

/**
 * Records a successful Cashfree payment in Supabase bookings & ledger
 */
export async function recordCashfreePaymentSuccess(
  bookingId: string,
  cfOrderId: string,
  paymentMethod: string = 'upi',
  amount?: number
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase not configured' };
  try {
    const isUuid = bookingId.includes('-');
    let query = supabase.from('bookings').select('id, estimated_price, final_price, driver_id, user_id');
    if (isUuid) {
      query = query.eq('id', bookingId);
    } else {
      query = query.or(`id.eq.${bookingId},booking_number.eq.${bookingId}`);
    }

    const { data: booking, error: bErr } = await query.maybeSingle();
    if (bErr || !booking) {
      console.warn('[Cashfree] Booking not found for recording payment:', bookingId);
      return { success: false, error: 'Booking not found' };
    }

    const finalPaid = amount || booking.final_price || booking.estimated_price || 0;

    // 1. Update Booking row
    await supabase
      .from('bookings')
      .update({
        payment_status: 'completed',
        payment_method: paymentMethod.toLowerCase(),
        payment_id: cfOrderId,
        final_price: finalPaid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id);

    // 2. Create or Update Ledger Entry
    const commission = Math.round(finalPaid * 0.10);
    const gst = Math.round(commission * 0.18);
    const partnerShare = finalPaid - commission;

    await supabase.from('ledger_entries').insert({
      ledger_number: `LDG-${Date.now()}`,
      booking_id: booking.id,
      payment_id: cfOrderId,
      driver_id: booking.driver_id || null,
      gross_customer_fare: finalPaid,
      commission_rate: 0.10,
      commission_amount: commission,
      gst_on_commission: gst,
      driver_gross_earning: partnerShare,
      customer_tip: 0,
      driver_net_earning: partnerShare,
      settlement_status: 'unsettled',
    });

    return { success: true };
  } catch (err: any) {
    console.warn('[Cashfree] recordPayment error:', err);
    return { success: false, error: err?.message };
  }
}
