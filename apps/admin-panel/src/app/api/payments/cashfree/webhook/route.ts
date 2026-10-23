import { NextResponse } from 'next/server';
import { recordCashfreePaymentSuccess } from '@omnigo/api';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    
    // Cashfree PG sends webhook data inside { data: { order: {...}, payment: {...} }, type: "PAYMENT_SUCCESS_WEBHOOK" }
    const type = rawBody?.type;
    const orderData = rawBody?.data?.order;
    const paymentData = rawBody?.data?.payment;

    if (type === 'PAYMENT_SUCCESS_WEBHOOK' || orderData?.order_status === 'PAID') {
      const orderId = orderData?.order_id;
      const amount = orderData?.order_amount || paymentData?.payment_amount;
      const method = paymentData?.payment_group || paymentData?.payment_method || 'upi';

      // Look up booking from order_id (format: omni_{bookingId}_...)
      if (orderId) {
        let bookingId = orderId;
        if (orderId.startsWith('omni_')) {
          const parts = orderId.split('_');
          if (parts.length >= 2) {
            bookingId = parts[1];
          }
        }
        await recordCashfreePaymentSuccess(bookingId, orderId, method, amount);
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    console.error('Error in Cashfree webhook:', error);
    return NextResponse.json({ status: 'ERROR', error: error?.message }, { status: 500 });
  }
}
