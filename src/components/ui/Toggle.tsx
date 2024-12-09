import React from 'react';
import { cn } from '../../lib/utils';

interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, className }) => {
  return (
    <label className={cn("flex items-center cursor-pointer", className)}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={cn(
          "block w-10 h-6 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-gray-600"
        )} />
        <div className={cn(
          "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
          checked && "transform translate-x-4"
        )} />
      </div>
      {label && <span className="ml-3 text-sm">{label}</span>}
    </label>
  );
};

export default Toggle;