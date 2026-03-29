/**
 * Converts Firebase Auth error codes into human-readable messages.
 */
export const getFriendlyErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    // Login Errors
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please try again.';
    case 'auth/user-not-found':
      return 'No user found with this email address. Please sign up if you don\'t have an account.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again in a few minutes.';
    
    // Cleanup/Signup Errors
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try logging in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact the administrator.';
    
    // General Errors
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again later.';
    
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
