import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 48, className = "" }) => {
  return (
    <div className={`spinner-container ${className}`} style={{ color: 'var(--primary)' }}>
      <Loader2 size={size} className="spinner" />
    </div>
  );
};

export default LoadingSpinner;
