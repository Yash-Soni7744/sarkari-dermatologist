// Server-side in-memory OTP store to avoid Firestore PERMISSION_DENIED issues for unauthenticated requests.
export interface OtpData {
  otp: string;
  expiresAt: number;
  name: string;
}

// Global variable to persist the Map across hot reloads in development
const globalForOtp = global as unknown as { otpStore: Map<string, OtpData> };

export const otpStore = globalForOtp.otpStore || new Map<string, OtpData>();

if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpStore = otpStore;
}
