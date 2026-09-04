import React from 'react';
import { Inbox } from 'lucide-react';
import Button, { ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-[#EAE4DF] ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FAF7F5] border border-[#EAE4DF] text-muted-foreground flex items-center justify-center mb-4">
        {icon || <Inbox className="w-6 h-6 text-[#756B70]" />}
      </div>
      <h3 className="text-base font-serif font-bold text-[#1F1B1C] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          size="sm"
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
