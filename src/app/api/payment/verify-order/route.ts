import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Query Cashfree for the current order status
    const env = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'TEST';
    const isProd = env === 'PROD' || env === 'PRODUCTION';
    const cashfreeUrl = isProd 
      ? `https://api.cashfree.com/pg/orders/${orderId}` 
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      return NextResponse.json({ error: 'Payment gateway configuration is missing' }, { status: 500 });
    }

    const response = await fetch(cashfreeUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree Verify Order Error Payload:', data);
      return NextResponse.json({ error: data.message || 'Failed to verify order status' }, { status: response.status });
    }

    if (data.order_status === 'PAID') {
      return NextResponse.json({ success: true, status: 'PAID' });
    } else {
      return NextResponse.json({ success: false, status: data.order_status, message: 'Order is not paid yet' });
    }

  } catch (error: any) {
    console.error('Verify Order API Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
