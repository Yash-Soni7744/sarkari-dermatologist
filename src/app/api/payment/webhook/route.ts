import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-webhook-signature');
    const timestamp = request.headers.get('x-webhook-timestamp');
    const rawBody = await request.text();

    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
    }

    const secretKey = process.env.CASHFREE_SECRET_KEY;
    if (!secretKey) {
      console.error('Webhook Secret (Cashfree Client Secret) is not configured');
      return NextResponse.json({ error: 'Webhook configuration missing' }, { status: 500 });
    }

    // 1. Verify Cashfree Webhook Signature
    const bodyToVerify = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(bodyToVerify)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.warn('Webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse payload
    const payload = JSON.parse(rawBody);

    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const cfOrderId = payload.data?.order?.order_id;
      
      if (!cfOrderId) {
        return NextResponse.json({ error: 'Missing order_id in webhook payload' }, { status: 400 });
      }

      // Extract appointmentId from order_id (Format: `order_${appointmentId}_${timestamp}`)
      let appointmentId = cfOrderId.replace(/^order_/, '');
      const lastUnderscore = appointmentId.lastIndexOf('_');
      if (lastUnderscore !== -1) {
        appointmentId = appointmentId.substring(0, lastUnderscore);
      }

      if (!appointmentId) {
        return NextResponse.json({ error: 'Invalid order_id format' }, { status: 400 });
      }

      if (!db) {
        return NextResponse.json({ error: 'Database service is not initialized' }, { status: 500 });
      }

      // 3. Fetch and update the appointment in Firestore
      const aptRef = doc(db, 'appointments', appointmentId);
      const aptSnap = await getDoc(aptRef);

      if (aptSnap.exists()) {
        const appointmentData = aptSnap.data();

        // Prevent double processing
        if (appointmentData.status !== 'confirmed' || appointmentData.paymentStatus !== 'paid') {
          await updateDoc(aptRef, {
            status: 'confirmed',
            paymentStatus: 'paid',
            verificationStatus: 'verified',
            paymentMethod: 'Cashfree PG',
            cfOrderId: cfOrderId
          });

          // 4. Trigger Email Confirmation
          try {
            const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            
            await fetch(`${origin}/api/emails/send-confirmation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: appointmentData.patientName,
                email: appointmentData.patientEmail,
                date: appointmentData.date,
                slot: appointmentData.slot,
                meetLink: appointmentData.meetLink
              })
            });
          } catch (emailErr: any) {
            console.error('Webhook Email Error:', emailErr.message);
          }
        }
      } else {
        console.warn(`Webhook received for non-existent appointment ID: ${appointmentId}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Handler Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
