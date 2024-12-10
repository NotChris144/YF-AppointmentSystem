import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onConfirm?: () => void;
  maxValue?: number;
  minValue?: number;
  className?: string;
  prefix?: string;
  disabled?: boolean;
}

const NumberPad: React.FC<NumberPadProps> = ({
  value,
  onChange,
  onBlur,
  onConfirm,
  maxValue = 999999.99,
  minValue = 0,
  className,
  prefix = '£',
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [showError, setShowError] = useState(false);

  // Format number with thousand separators and 2 decimal places
  const formatNumber = (num: string): string => {
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts[1]) {
      parts[1] = parts[1].substring(0, 2); // Limit to 2 decimal places
    }
    return parts.join('.');
  };

  // Remove formatting for calculations
  const unformatNumber = (num: string): string => {
    return num.replace(/[^0-9.]/g, '');
  };

  const handleNumberClick = (num: string) => {
    if (disabled) return;

    let newValue = unformatNumber(displayValue);
    
    // Handle decimal point
    if (num === '.') {
      if (newValue.includes('.')) return;
      newValue = newValue + num;
    } else {
      // Replace initial 0 with the new number
      if (newValue === '0') {
        newValue = num;
      } else {
        newValue = newValue + num;
      }
    }
    
    // Validate max decimal places
    const parts = newValue.split('.');
    if (parts[1] && parts[1].length > 2) return;

    // Validate max value
    if (parseFloat(newValue) > maxValue) {
      setShowError(true);
      setTimeout(() => setShowError(false), 1000);
      return;
    }

    setDisplayValue(formatNumber(newValue));
    onChange(newValue);
  };

  const handleDelete = () => {
    if (disabled) return;
    const unformatted = unformatNumber(displayValue);
    const newValue = unformatted.slice(0, -1);
    setDisplayValue(formatNumber(newValue) || '0');
    onChange(newValue || '0');
  };

  const handleClear = () => {
    if (disabled) return;
    setDisplayValue('0');
    onChange('0');
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;
      
      if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        handleNumberClick(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [displayValue, disabled]);

  const buttonVariants = {
    hover: { scale: 1.05, backgroundColor: 'rgb(var(--primary-600))' },
    tap: { scale: 0.95 },
    disabled: { opacity: 0.5, cursor: 'not-allowed' }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto p-4', className)}>
      {/* Display */}
      <div className="relative mb-4">
        <div
          className={cn(
            'w-full p-4 text-3xl font-bold text-right rounded-lg bg-card/50 border border-border/50',
            'focus:border-primary focus:ring-0',
            showError ? 'animate-shake text-red-500' : ''
          )}
          role="textbox"
          aria-label="Numeric input"
        >
          {prefix}{displayValue}
        </div>
      </div>

      {/* Number Pad Grid */}
      <div className="grid grid-cols-3 gap-2">
        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
          <motion.button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            className={cn(
              "p-4 text-2xl font-semibold rounded-lg",
              "bg-card/50 border border-border/50",
              "hover:bg-primary/5 hover:border-primary/20 active:bg-primary/10",
              "transition-all duration-200"
            )}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={disabled}
            aria-label={num.toString()}
          >
            {num}
          </motion.button>
        ))}

        {/* Bottom Row */}
        <motion.button
          onClick={() => handleNumberClick('.')}
          className={cn(
            "p-4 text-2xl font-semibold rounded-lg",
            "bg-card/50 border border-border/50",
            "hover:bg-primary/5 hover:border-primary/20 active:bg-primary/10",
            "transition-all duration-200"
          )}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          disabled={disabled}
          aria-label="Decimal point"
        >
          .
        </motion.button>

        <motion.button
          onClick={() => handleNumberClick('0')}
          className={cn(
            "p-4 text-2xl font-semibold rounded-lg",
            "bg-card/50 border border-border/50",
            "hover:bg-primary/5 hover:border-primary/20 active:bg-primary/10",
            "transition-all duration-200"
          )}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          disabled={disabled}
          aria-label="Zero"
        >
          0
        </motion.button>

        <motion.button
          onClick={handleDelete}
          className={cn(
            "p-4 text-2xl font-semibold rounded-lg",
            "bg-card/50 border border-border/50",
            "hover:bg-primary/5 hover:border-primary/20 active:bg-primary/10",
            "transition-all duration-200"
          )}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          disabled={disabled}
          aria-label="Delete"
        >
          <Delete className="w-6 h-6 mx-auto" />
        </motion.button>

        {/* Confirm Button - Full Width */}
        <motion.button
          onClick={onConfirm}
          className={cn(
            "col-span-3 p-4 text-xl font-semibold rounded-lg",
            "bg-primary/10 border border-primary/20",
            "hover:bg-primary/20 hover:border-primary/30",
            "active:bg-primary/30 transition-all duration-200",
            "text-primary shadow-sm shadow-primary/10",
            "flex items-center justify-center"
          )}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          disabled={disabled}
          aria-label="Confirm"
        >
          <Check className="w-6 h-6 transition-transform hover:scale-110" />
        </motion.button>
      </div>
    </div>
  );
};

export default NumberPad;
