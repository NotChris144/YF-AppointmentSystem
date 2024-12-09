import React from 'react';
import { cn } from '../../lib/utils';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showInput?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  className,
  showInput = true,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(Math.min(Math.max(newValue, min), max));
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {label && <label className="block text-sm font-medium text-gray-200">{label}</label>}
        {showInput && (
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            className="w-20 px-2 py-1 text-sm bg-background border border-input rounded-md"
            min={min}
            max={max}
            step={step}
          />
        )}
      </div>
      <input
        type="range"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
};

export default Slider;