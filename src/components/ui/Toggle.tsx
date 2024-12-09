import React from 'react';
import { cn } from '../../lib/utils';

interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ 
  label, 
  checked, 
  onChange, 
  className,
  disabled = false 
}) => {
  return (
    <label 
      className={cn(
        "flex items-center",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className
      )}
    >
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={cn(
          "block w-11 h-6 rounded-full transition-colors duration-200",
          "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30",
          checked ? "bg-primary" : "bg-muted/30",
          disabled && "opacity-50"
        )} />
        <div className={cn(
          "absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm",
          "transition-transform duration-200 ease-in-out",
          checked && "translate-x-5",
          disabled && "opacity-50"
        )} />
      </div>
      {label && (
        <span className={cn(
          "ml-3 text-sm font-medium text-foreground select-none",
          disabled && "opacity-50"
        )}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Toggle;