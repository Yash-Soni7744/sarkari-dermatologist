import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY || 'sarkari_dermatologist_default_secret_key_123';
const KEY = crypto.createHash('sha256').update(SECRET_KEY).digest();

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

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

    // Generate secure encrypted state token to prevent serverless state loss in production
    let token = '';
    try {
      token = encrypt(JSON.stringify({
        phone: cleanPhone,
        otp: otp,
        expiresAt: expiresAt,
        name: name || ''
      }));
    } catch (tokenErr: any) {
      console.error('[OTP] Error encrypting token:', tokenErr.message);
    }

    console.log(`[OTP DEBUG] Generated OTP for ${cleanPhone} (${name || 'Guest'}): ${otp}`);

    let otpSentReal = false;
    let providerUsed = '';

    // 1. Check for Fast2SMS (WhatsApp template API)
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey && fast2smsKey !== 'your_fast2sms_api_key_here') {
      try {
        // Prepare phone number for WhatsApp (E.164 with '+' prefix, e.g. +91XXXXXXXXXX)
        let whatsappPhone = cleanPhone;
        if (!whatsappPhone.startsWith('+')) {
          if (whatsappPhone.startsWith('91') && whatsappPhone.length === 12) {
            whatsappPhone = `+${whatsappPhone}`;
          } else {
            whatsappPhone = `+91${whatsappPhone}`;
          }
        }

        // We also prepare a clean 10-digit number just in case we fallback to standard SMS
        let smsPhone = cleanPhone;
        if (smsPhone.startsWith('+91')) {
          smsPhone = smsPhone.substring(3);
        } else if (smsPhone.startsWith('91') && smsPhone.length === 12) {
          smsPhone = smsPhone.substring(2);
        }

        // WhatsApp settings from template details in image
        const whatsappPhoneNumberId = '118867381768499';
        const whatsappTemplateName = 'process_initiated_message';
        const whatsappMessageId = '25040';

        console.log(`[OTP] Attempting to send WhatsApp OTP to ${whatsappPhone} using template ${whatsappTemplateName}...`);

        let success = false;
        let methodUsed = '';

        // Try Method A: Simple Template API (GET) - Verified working method
        try {
          console.log(`[OTP] Sending via Simple WhatsApp GET API...`);
          // Using senderId parameter instead of phone_number_id as validated by Fast2SMS backend
          const simpleUrl = `https://www.fast2sms.com/dev/whatsapp?authorization=${encodeURIComponent(fast2smsKey)}&message_id=${whatsappMessageId}&senderId=${whatsappPhoneNumberId}&numbers=${encodeURIComponent(whatsappPhone)}&variables_values=${encodeURIComponent(otp)}`;
          const simpleRes = await fetch(simpleUrl, {
            method: 'GET',
            headers: {
              'accept': 'application/json'
            }
          });

          const simpleData = await simpleRes.json();
          if (simpleRes.ok && simpleData.return === true) {
            success = true;
            methodUsed = 'Fast2SMS WhatsApp (Simple API)';
            console.log(`[OTP] Sent via Simple API:`, simpleData);
          } else {
            console.warn(`[OTP] Simple API failed:`, simpleData);
          }
        } catch (simpleErr: any) {
          console.warn(`[OTP] Simple API error:`, simpleErr.message);
        }

        // Try Method B: Advanced Meta Format API (POST) - Fallback
        if (!success) {
          try {
            console.log(`[OTP] Retrying via Advanced Meta Format API (POST)...`);
            const metaUrl = `https://www.fast2sms.com/dev/whatsapp/v24.0/${whatsappPhoneNumberId}/messages`;
            const metaRes = await fetch(metaUrl, {
              method: 'POST',
              headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': fast2smsKey
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: whatsappPhone,
                type: 'template',
                template: {
                  name: whatsappTemplateName,
                  language: {
                    code: 'en'
                  },
                  components: [
                    {
                      type: 'body',
                      parameters: [
                        {
                          type: 'text',
                          text: otp
                        }
                      ]
                    }
                  ]
                }
              })
            });

            const metaData = await metaRes.json();
            if (metaRes.ok && (metaData.messages || metaData.success || metaData.return === true)) {
              success = true;
              methodUsed = 'Fast2SMS WhatsApp (Meta API)';
              console.log(`[OTP] Sent via Meta API:`, metaData);
            } else {
              console.warn(`[OTP] Meta API call failed:`, metaData);
            }
          } catch (metaErr: any) {
            console.warn(`[OTP] Meta API error:`, metaErr.message);
          }
        }

        // Logging error if WhatsApp fails (SMS fallback is disabled)
        if (!success) {
          console.error('[OTP] WhatsApp sending failed. SMS fallback is disabled.');
        }

        if (success) {
          otpSentReal = true;
          providerUsed = methodUsed;
        }
      } catch (err: any) {
        console.error('[OTP] Fast2SMS error block:', err.message);
      }
    }

    // 2. Twilio SMS (Disabled as per configuration: OTP must not be sent via SMS)
    /*
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
    */

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
      message: otpSentReal ? `OTP sent successfully via ${providerUsed}` : "OTP generated (Mock Mode)",
      token: token
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
