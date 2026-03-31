import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="page-loader">
      <LoadingSpinner size={64} />
      <p style={{ 
        marginTop: '1.5rem', 
        color: 'var(--primary)', 
        fontWeight: '600',
        fontSize: '1.1rem'
      }}>
        Loading Sarkari Dermatologist...
      </p>
    </div>
  );
}
