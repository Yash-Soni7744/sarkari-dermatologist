import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      console.error('Cashfree configuration missing');
      return NextResponse.json({ error: 'Payment gateway not configured correctly' }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'TEST' 
      ? `https://sandbox.cashfree.com/pg/orders/${orderId}` 
      : `https://api.cashfree.com/pg/orders/${orderId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID!,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree Verify Error:', data.message);
      return NextResponse.json({ error: data.message }, { status: response.status });
    }

    // Return the full order object which includes 'order_status'
    return NextResponse.json({
        order_id: data.order_id,
        order_status: data.order_status,
        order_amount: data.order_amount,
        payment_session_id: data.payment_session_id
    });

  } catch (error: any) {
    console.error('Cashfree Verify Internal Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
