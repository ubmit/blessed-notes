import * as React from 'react';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-600',
        primary: 'bg-blue-50 text-blue-700',
        success: 'bg-emerald-50 text-emerald-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({className, variant, ...props}, ref) => (
    <div
      ref={ref}
      className={cn(badgeVariants({variant, className}))}
      {...props}
    />
  ),
);
Badge.displayName = 'Badge';
