import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

export default function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block text-xs bg-slate-50 ring-1 ring-slate-200 rounded-full px-2 py-0.5",
        className
      )}
      {...props}
    />
  );
}