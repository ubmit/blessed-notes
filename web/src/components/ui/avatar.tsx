import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import {cn} from '../../lib/utils';

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({className, ...props}, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-semibold text-blue-600',
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({className, ...props}, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn('uppercase', className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
