import React, { forwardRef } from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '', glow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative bg-aurora-glass backdrop-blur-xl rounded-2xl transition-all duration-300 ${
          glow
            ? 'aurora-glow-border border border-transparent'
            : 'border border-aurora-glassBorder'
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
