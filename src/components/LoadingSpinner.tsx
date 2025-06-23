import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  overlay = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}></div>
        
        {/* Inner crown icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Crown className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-8 w-8'} text-gold-500 animate-pulse`} />
        </div>
        
        {/* Sparkles */}
        <div className="absolute -top-1 -right-1">
          <Sparkles className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} text-gold-400 animate-bounce`} />
        </div>
      </div>
      
      {text && (
        <div className={`${textSizeClasses[size]} font-medium text-royal-600 animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-premium p-8 border border-royal-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Skeleton loader component for better UX
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-royal-200 rounded-lg ${className}`}>
      <div className="shimmer-loading h-full w-full rounded-lg bg-gradient-to-r from-royal-200 via-royal-100 to-royal-200"></div>
    </div>
  );
};

// Table skeleton for invoice/client lists
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader 
              key={colIndex} 
              className={`h-6 ${colIndex === 0 ? 'w-32' : colIndex === 1 ? 'w-24' : colIndex === 2 ? 'w-20' : 'w-16'}`} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Card skeleton for dashboard widgets
export const CardSkeleton: React.FC = () => {
  return (
    <div className="card-royal p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <SkeletonLoader className="h-12 w-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader className="h-4 w-24" />
          <SkeletonLoader className="h-6 w-16" />
        </div>
      </div>
      <SkeletonLoader className="h-4 w-32" />
    </div>
  );
};