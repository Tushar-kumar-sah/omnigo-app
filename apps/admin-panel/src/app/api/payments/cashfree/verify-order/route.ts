import { NextResponse } from 'next/server';
import { verifyCashfreePayment, recordCashfreePaymentSuccess } from '@omnigo/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, bookingId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const verification = await verifyCashfreePayment(orderId);

    if (verification.isPaid && bookingId) {
      await recordCashfreePaymentSuccess(
        bookingId,
        orderId,
        'cashfree_pg',
        verification.orderAmount
      );
    }

    return NextResponse.json(verification);
  } catch (error: any) {
    console.error('Error in Cashfree verify-order API:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
