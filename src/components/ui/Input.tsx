import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helper,
  className, 
  type = 'text',
  ...props 
}) => {
  // Format phone numbers as they're typed
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'tel') {
      // Remove all non-numeric characters
      let value = e.target.value.replace(/\D/g, '');
      
      // Format as UK phone number (max 11 digits)
      if (value.length > 11) {
        value = value.slice(0, 11);
      }
      
      if (value.length > 0) {
        // Handle international format
        if (value.startsWith('44')) {
          value = '0' + value.slice(2);
        }
        
        // Format: 07700 900 000
        if (value.length > 4) {
          value = value.slice(0, 4) + ' ' + value.slice(4);
        }
        if (value.length > 8) {
          value = value.slice(0, 8) + ' ' + value.slice(8);
        }
      }
      
      e.target.value = value;
    }
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          className={cn(
            "w-full px-3 py-2 bg-background rounded-md border border-input",
            "text-foreground placeholder:text-muted/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-200",
            error && "border-error focus:ring-error/30 focus:border-error",
            className
          )}
          onChange={handleChange}
          {...props}
        />
      </div>
      {(helper || error) && (
        <p className={cn(
          "text-sm",
          error ? "text-error" : "text-muted"
        )}>
          {error || helper}
        </p>
      )}
    </div>
  );
};

export default Input;