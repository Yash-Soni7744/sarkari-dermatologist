import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { otpStore } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();
    if (!phone || !otp) {
      return NextResponse.json({ success: false, error: 'Phone number and OTP are required' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\s+/g, '');

    // Fetch from in-memory store
    const data = otpStore.get(cleanPhone);

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
