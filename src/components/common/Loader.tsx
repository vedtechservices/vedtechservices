import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className, size = 24 }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`animate-spin text-primary ${className}`} size={size} />
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-4">
        {/* Animated logo or brand indicator */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <img 
               src="https://miaoda-conversation-file.s3cdn.medo.dev/user-8t7j0johoxds/conv-99gjdx4fbuv4/20260302/file-9znj7azzuakg.png" 
               alt="VedTech Logo" 
               className="h-8 w-8 rounded-full"
             />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold tracking-tight text-primary">VedTech Services</h2>
          <p className="text-sm text-muted-foreground animate-pulse">Initializing IT solutions...</p>
        </div>
      </div>
    </div>
  );
};
