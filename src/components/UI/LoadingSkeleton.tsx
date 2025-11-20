import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'player' | 'text' | 'circle';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  variant = 'card' 
}) => {
  const baseClasses = 'skeleton bg-gray-800 animate-pulse';
  
  const variantClasses = {
    card: 'rounded-lg h-48',
    player: 'rounded-xl h-96',
    text: 'rounded h-4',
    circle: 'rounded-full w-12 h-12'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading content"
    />
  );
};

export const TrackCardSkeleton: React.FC = () => (
  <div className="bg-gray-900/50 rounded-lg p-4 min-h-[200px] animate-pulse">
    <LoadingSkeleton variant="circle" className="mx-auto mb-4" />
    <LoadingSkeleton variant="text" className="w-3/4 mx-auto mb-2" />
    <LoadingSkeleton variant="text" className="w-1/2 mx-auto mb-2" />
    <LoadingSkeleton variant="text" className="w-2/3 mx-auto" />
  </div>
);

export const PlayerSkeleton: React.FC = () => (
  <div className="bg-gray-900/50 rounded-xl p-6 animate-pulse">
    <div className="flex items-center gap-6 mb-6">
      <LoadingSkeleton variant="circle" className="w-20 h-20" />
      <div className="flex-1">
        <LoadingSkeleton variant="text" className="w-3/4 mb-2 h-6" />
        <LoadingSkeleton variant="text" className="w-1/2 h-4" />
      </div>
    </div>
    <LoadingSkeleton variant="text" className="w-full h-2 mb-4" />
    <div className="flex justify-center gap-4">
      <LoadingSkeleton variant="circle" className="w-12 h-12" />
      <LoadingSkeleton variant="circle" className="w-16 h-16" />
      <LoadingSkeleton variant="circle" className="w-12 h-12" />
    </div>
  </div>
);