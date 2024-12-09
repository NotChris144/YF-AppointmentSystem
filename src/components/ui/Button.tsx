import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        "disabled:opacity-50 disabled:pointer-events-none",
        
        // Variants
        variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === 'outline' && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
        
        // Sizes
        size === 'default' && "h-10 px-4 py-2",
        size === 'sm' && "h-9 px-3",
        size === 'lg' && "h-11 px-8",
        
        className
      )}
      {...props}
    />
  );
};

export default Button;
