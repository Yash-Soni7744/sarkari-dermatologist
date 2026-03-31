// src/components/auth/ProtectedRoute.tsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'patient' | 'doctor';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Not logged in -> Redirect to login
        const loginPath = allowedRole === 'doctor' ? '/auth/doctor-login' : '/auth/login';
        router.push(loginPath);
      } else if (allowedRole && user?.role !== allowedRole) {
        // Wrong role -> Redirect to their respective dashboard or home
        if (user?.role === 'doctor') {
          router.push('/doctor/dashboard');
        } else {
          router.push('/profile');
        }
      }
    }
  }, [loading, isAuthenticated, user, allowedRole, router]);

  if (loading || !isAuthenticated || (allowedRole && user?.role !== allowedRole)) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--background)'
      }}>
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return <>{children}</>;
}
