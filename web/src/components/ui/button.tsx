import * as React from 'react';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-500',
        secondary: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
        outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      },
      size: {
        default: 'px-5 py-3',
        sm: 'px-4 py-2 text-xs',
        lg: 'px-6 py-4 text-base',
        icon: 'h-10 w-10 rounded-full p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size, type = 'button', ...props}, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({variant, size, className}))}
      type={type}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
