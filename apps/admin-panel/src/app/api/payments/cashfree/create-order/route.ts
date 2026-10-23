import { NextResponse } from 'next/server';
import { createCashfreeOrder } from '@omnigo/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, orderAmount, customerId, customerName, customerPhone, customerEmail, returnUrl, orderNote } = body;

    if (!orderAmount || isNaN(Number(orderAmount))) {
      return NextResponse.json({ success: false, error: 'Valid orderAmount is required' }, { status: 400 });
    }

    const orderRes = await createCashfreeOrder({
      orderId,
      orderAmount: Number(orderAmount),
      customerId: customerId || 'cust_' + Date.now(),
      customerName: customerName || 'OmniGo Customer',
      customerPhone: customerPhone || '9876543210',
      customerEmail: customerEmail || 'support@omnigo.in',
      returnUrl,
      orderNote,
    });

    if (!orderRes.success) {
      return NextResponse.json({ success: false, error: orderRes.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: orderRes.orderId,
      cfOrderId: orderRes.cfOrderId,
      paymentSessionId: orderRes.paymentSessionId,
      orderStatus: orderRes.orderStatus,
      orderAmount: orderRes.orderAmount,
      paymentUrl: orderRes.paymentUrl,
    });
  } catch (error: any) {
    console.error('Error in Cashfree create-order API:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
