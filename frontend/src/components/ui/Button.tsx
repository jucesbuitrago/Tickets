import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D71920]/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[#D71920] text-white hover:bg-[#b9151b] focus:bg-[#b9151b]',
        outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus:bg-slate-50',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900',
        orange: 'bg-[#FF7A00] text-white hover:brightness-110 focus:brightness-110',
        black: 'bg-black text-white hover:brightness-110 focus:brightness-110',
      },
      loading: {
        true: 'cursor-not-allowed opacity-70',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, loading, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, loading }), className)}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };