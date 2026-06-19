import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { appointmentId, amount, patientId, patientName, patientEmail, patientPhone } = await request.json();

    if (!appointmentId || !amount) {
      return NextResponse.json({ error: 'Missing required order parameters (appointmentId, amount)' }, { status: 400 });
    }

    // Prepare customer phone
    let phone = patientPhone || '9999999999';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.length < 10) {
      phone = '9999999999';
    }

    // Prepare Cashfree request parameters
    const env = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'TEST';
    const isProd = env === 'PROD' || env === 'PRODUCTION';
    const cashfreeUrl = isProd 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';

    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      console.error('Cashfree credentials are missing in environment variables');
      return NextResponse.json({ error: 'Payment gateway configuration is missing' }, { status: 500 });
    }

    // Create a unique Order ID in Cashfree to prevent duplicate order errors on retries
    const cfOrderId = `order_${appointmentId}_${Date.now()}`;
    let origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Cashfree production PG requires return_url to use HTTPS protocol
    if (isProd) {
      origin = origin.replace(/^http:/, 'https:');
    }

    const orderRequest = {
      order_id: cfOrderId,
      order_amount: Number(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: patientId || 'guest_patient',
        customer_name: patientName || 'Patient',
        customer_email: patientEmail || 'patient@example.com',
        customer_phone: phone
      },
      order_meta: {
        return_url: `${origin}/book?order_id=${cfOrderId}&appointment_id=${appointmentId}`
      }
    };

    // Send request to Cashfree PG API
    const response = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      },
      body: JSON.stringify(orderRequest)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree Create Order Error Payload:', data);
      return NextResponse.json({ error: data.message || 'Failed to create order on Cashfree' }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      payment_session_id: data.payment_session_id,
      cf_order_id: cfOrderId
    });

  } catch (error: any) {
    console.error('Create Order API Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
