import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, orderAmount, orderCurrency, customerDetails } = body;
    
    if (!process.env.NEXT_PUBLIC_CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      console.error('Cashfree configuration missing');
      return NextResponse.json({ error: 'Payment gateway not configured correctly' }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'TEST' 
      ? 'https://sandbox.cashfree.com/pg/orders' 
      : 'https://api.cashfree.com/pg/orders';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID!,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: orderCurrency,
        customer_details: {
          customer_id: customerDetails.id,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone,
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/book?order_id={order_id}`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Cashfree Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
