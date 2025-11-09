import React from 'react';
import { cn } from '../../lib/utils';

interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const AdminCard = React.forwardRef<HTMLDivElement, AdminCardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6',
        className
      )}
      {...props}
    />
  )
);
AdminCard.displayName = 'AdminCard';

export { AdminCard };