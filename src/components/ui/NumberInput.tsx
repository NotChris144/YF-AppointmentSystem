import React, { useState, useEffect } from 'react';

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  max?: number;
  className?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  prefix = '£',
  suffix,
  placeholder = '0.00',
  max,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format number with commas and decimals
  const formatNumber = (num: string) => {
    // Remove all non-numeric characters except decimal point
    const cleanNum = num.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanNum.split('.');
    const wholePart = parts[0];
    const decimalPart = parts[1]?.slice(0, 2) || '00';

    // Add commas to whole part
    const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return `${formattedWhole}.${decimalPart}`;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9.]/g, '');
    
    if (max && parseFloat(inputValue) > max) {
      return;
    }

    onChange(inputValue);
  };

  // Update display value when value changes
  useEffect(() => {
    if (value) {
      setDisplayValue(formatNumber(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  return (
    <div className={`relative group ${className}`}>
      <div
        className={`
          w-full p-4 rounded-lg border transition-all duration-200
          ${isFocused 
            ? 'border-primary/50 bg-card/50 shadow-lg shadow-primary/5' 
            : 'border-border/50 bg-card hover:border-border'
          }
        `}
      >
        <div className="flex items-center gap-2">
          {prefix && (
            <span className="text-muted-foreground">{prefix}</span>
          )}
          <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl font-medium placeholder:text-muted-foreground/50"
          />
          {suffix && (
            <span className="text-muted-foreground">{suffix}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumberInput;
