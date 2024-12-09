import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <input
        className={cn(
          "input",
          error && "border-error focus:ring-error",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-error mt-1">{error}</p>}
    </div>
  );
};

export default Input;