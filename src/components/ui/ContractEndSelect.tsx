import React from 'react';
import { addMonths, format } from 'date-fns';
import { cn } from '../../lib/utils';

interface ContractEndSelectProps {
  value: Date | null;
  onChange: (date: Date) => void;
  className?: string;
}

const ContractEndSelect: React.FC<ContractEndSelectProps> = ({
  value,
  onChange,
  className,
}) => {
  const options = [
    { label: '6 Months', months: 6 },
    { label: '1 Year', months: 12 },
    { label: '18 Months', months: 18 },
    { label: '2 Years', months: 24 },
  ];

  const today = new Date();
  const selectedMonths = value
    ? Math.round(
        (value.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
    : null;

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-gray-200">
        Contract End Date
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {options.map(({ label, months }) => (
          <button
            key={months}
            type="button"
            onClick={() => onChange(addMonths(today, months))}
            className={cn(
              "px-4 py-2 rounded-md text-sm transition-colors",
              selectedMonths === months
                ? "bg-primary text-white"
                : "bg-card hover:bg-card-hover"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <span className="text-sm text-gray-400">Or select specific date:</span>
        <input
          type="date"
          value={value ? format(value, 'yyyy-MM-dd') : ''}
          onChange={(e) => onChange(new Date(e.target.value))}
          min={format(today, 'yyyy-MM-dd')}
          className="px-2 py-1 text-sm bg-background border border-input rounded-md"
        />
      </div>
    </div>
  );
};

export default ContractEndSelect;