import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { otpStore } from '@/lib/otpStore';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY || 'sarkari_dermatologist_default_secret_key_123';
const KEY = crypto.createHash('sha256').update(SECRET_KEY).digest();

function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !encrypted) throw new Error('Invalid token format');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function POST(request: Request) {
  try {
    const { phone, otp, token } = await request.json();
    if (!phone || !otp) {
      return NextResponse.json({ success: false, error: 'Phone number and OTP are required' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\s+/g, '');

    let data: { otp: string, expiresAt: number, name: string, phone?: string } | undefined = undefined;

    // 1. Try verifying via stateless encrypted token (Primary method for serverless)
    if (token) {
      try {
        const decrypted = decrypt(token);
        data = JSON.parse(decrypted);
        // Security check: Make sure token belongs to the phone number requested
        if (data && data.phone !== cleanPhone) {
          console.warn('[OTP] Token phone number mismatch');
          data = undefined;
        }
      } catch (err: any) {
        console.error('[OTP] Token decryption failed:', err.message);
      }
    }

    // 2. Fallback to server side in-memory store (Backup for development)
    if (!data) {
      data = otpStore.get(cleanPhone);
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'No OTP requested for this phone number' }, { status: 400 });
    }
    
    // Check expiry
    if (data.expiresAt < Date.now()) {
      otpStore.delete(cleanPhone);
      return NextResponse.json({ success: false, error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Verify OTP code
    if (data.otp !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid OTP. Please check the code and try again.' }, { status: 400 });
    }

    // OTP is valid. Clean up the entry
    otpStore.delete(cleanPhone);

    // Generate secure deterministic credentials
    const secretKey = process.env.CASHFREE_SECRET_KEY || 'sarkari_dermatologist_default_secret_key_123';
    const email = `${cleanPhone}@sarkaridermatologist.com`;
    
    const password = crypto
      .createHmac('sha256', secretKey)
      .update(`OTP_USER_${cleanPhone}`)
      .digest('hex')
      .substring(0, 20); // 20 chars password

    return NextResponse.json({
      success: true,
      firebaseEmail: email,
      firebasePassword: password,
      phone: cleanPhone,
      name: data.name
    });
  } catch (error: any) {
    console.error('OTP Verify Error:', error.message);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
