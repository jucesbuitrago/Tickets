import React from 'react';
import { cn } from '../../lib/utils';

interface AdminBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'inactive';
}

const AdminBadge = React.forwardRef<HTMLSpanElement, AdminBadgeProps>(
  ({ className, variant = 'active', ...props }, ref) => {
    const variants = {
      active: 'bg-green-50 text-green-700 ring-green-200',
      inactive: 'bg-gray-50 text-gray-700 ring-gray-200',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1',
          variants[variant],
          className
        )}
        {...props}
      >
        <span className={cn(
          'h-1.5 w-1.5 rounded-full',
          variant === 'active' ? 'bg-green-500' : 'bg-gray-500'
        )} />
        {variant === 'active' ? 'Active' : 'Inactive'}
      </span>
    );
  }
);
AdminBadge.displayName = 'AdminBadge';

export { AdminBadge };