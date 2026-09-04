import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
  isCard?: boolean;
}

export function LoadingState({
  message = 'Đang tải dữ liệu...',
  className = '',
  isCard = false,
}: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      <p className="text-xs font-medium text-muted-foreground">{message}</p>
    </div>
  );

  if (isCard) {
    return (
      <div className={`bg-white rounded-2xl border border-[#EAE4DF] ${className}`}>
        {content}
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}

export default LoadingState;
