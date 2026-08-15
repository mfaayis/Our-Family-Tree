import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-amber-700 text-white',
        secondary: 'border-transparent bg-stone-100 text-stone-800',
        destructive: 'border-transparent bg-red-100 text-red-700',
        outline: 'text-stone-700',
        success: 'border-transparent bg-emerald-100 text-emerald-700',
        warning: 'border-transparent bg-amber-100 text-amber-800',
        male: 'border-blue-200 bg-blue-50 text-blue-700',
        female: 'border-rose-200 bg-rose-50 text-rose-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
