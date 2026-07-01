import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { phone, name } = await request.json();
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    // Clean phone number (remove spaces, etc)
    const cleanPhone = phone.replace(/\s+/g, '');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 5 minutes expiry
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Save to in-memory store
    otpStore.set(cleanPhone, {
      otp: otp,
      expiresAt: expiresAt,
      name: name || ''
    });

    console.log(`[OTP DEBUG] Generated OTP for ${cleanPhone} (${name || 'Guest'}): ${otp}`);

    let otpSentReal = false;
    let providerUsed = '';

    // 1. Check for Fast2SMS (Popular Indian SMS provider)
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey && fast2smsKey !== 'your_fast2sms_api_key_here') {
      try {
        // Strip country code if present for Fast2SMS
        let fast2smsPhone = cleanPhone;
        if (fast2smsPhone.startsWith('+91')) {
          fast2smsPhone = fast2smsPhone.substring(3);
        } else if (fast2smsPhone.startsWith('91') && fast2smsPhone.length === 12) {
          fast2smsPhone = fast2smsPhone.substring(2);
        }

        const url = 'https://www.fast2sms.com/dev/bulkV2';
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'authorization': fast2smsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: fast2smsPhone
          })
        });

        if (res.ok) {
          otpSentReal = true;
          providerUsed = 'Fast2SMS';
          console.log(`[OTP] Successfully sent OTP via Fast2SMS to ${fast2smsPhone}`);
        } else {
          const errText = await res.text();
          console.error('[OTP] Fast2SMS API failed:', errText);
        }
      } catch (err: any) {
        console.error('[OTP] Fast2SMS error:', err.message);
      }
    }

    // 2. Check for Twilio SMS (if Fast2SMS was not configured or failed)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (!otpSentReal && accountSid && authToken && twilioFrom && accountSid !== 'your_twilio_sid_here') {
      try {
        let twilioPhone = cleanPhone;
        if (!twilioPhone.startsWith('+')) {
          twilioPhone = `+${twilioPhone}`;
        }

        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        
        const body = new URLSearchParams();
        body.append('To', twilioPhone);
        body.append('From', twilioFrom);
        body.append('Body', `Your OTP for Sarkari Dermatologist is: ${otp}. Valid for 5 minutes.`);

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body.toString()
        });

        if (res.ok) {
          otpSentReal = true;
          providerUsed = 'Twilio';
          console.log(`[OTP] Successfully sent OTP via Twilio to ${twilioPhone}`);
        } else {
          const errText = await res.text();
          console.error('[OTP] Twilio API failed:', errText);
        }
      } catch (err: any) {
        console.error('[OTP] Twilio error:', err.message);
      }
    }

    // 3. Check for Interakt WhatsApp (if previous failed or not configured)
    const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
    if (!otpSentReal && WHATSAPP_API_KEY && WHATSAPP_API_KEY !== 'your_interakt_or_wati_api_key_here') {
      try {
        const fullPhoneNumber = cleanPhone.replace(/\+/g, '').replace(/\s+/g, '');
        const res = await fetch('https://api.interakt.ai/v1/public/message/', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${WHATSAPP_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fullPhoneNumber,
            type: "Template",
            template: {
              name: "otp_verification",
              languageCode: "en",
              bodyValues: [otp]
            }
          })
        });

        if (res.ok) {
          otpSentReal = true;
          providerUsed = 'Interakt WhatsApp';
          console.log(`[OTP] Successfully sent OTP via Interakt to ${fullPhoneNumber}`);
        } else {
          const errText = await res.text();
          console.error('[OTP] Interakt API failed:', errText);
        }
      } catch (err: any) {
        console.error('[OTP] Interakt error:', err.message);
      }
    }

    const responsePayload: any = {
      success: true,
      message: otpSentReal ? `OTP sent successfully via ${providerUsed}` : "OTP generated (Mock Mode)"
    };

    // Return OTP in response if no real provider was configured or succeeded (so testing is not blocked)
    if (!otpSentReal) {
      responsePayload.otp = otp;
      responsePayload.mock = true;
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('OTP Send Error:', error.message);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
