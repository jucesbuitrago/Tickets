import React from 'react';
import { cn } from '../../lib/utils';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger';
}

const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const baseClasses = 'rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300';

    const variants = {
      primary: 'bg-[#2970FF] hover:bg-[#155EEF] text-white',
      danger: 'bg-transparent ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50',
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], className)}
        {...props}
      />
    );
  }
);
AdminButton.displayName = 'AdminButton';

export { AdminButton };