import * as React from 'react';
import {cn} from '../../lib/utils';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({className, type, ...props}, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
