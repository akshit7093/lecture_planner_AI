import { cn } from '../lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-primary': variant === 'default',
            'text-primary-foreground': variant === 'default',
            'hover:bg-primary/90': variant === 'default',
            'hover:bg-accent': variant === 'ghost',
            'hover:text-accent-foreground': variant === 'ghost',
            'text-primary': variant === 'link',
            'underline-offset-4': variant === 'link',
            'hover:underline': variant === 'link',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 px-3': size === 'sm',
            'h-11 px-8': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';