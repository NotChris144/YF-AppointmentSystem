import React from 'react';
import { format, addDays, setHours, setMinutes, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  minDate = new Date(),
  maxDate = addDays(new Date(), 30),
  className,
}) => {
  const timeSlots = React.useMemo(() => {
    const slots: Date[] = [];
    const start = 9; // 9 AM
    const end = 19; // 7 PM
    const interval = 30; // 30 minutes

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = setMinutes(setHours(new Date(), hour), minute);
        slots.push(time);
      }
    }

    return slots;
  }, []);

  const isTimeSlotAvailable = (time: Date) => {
    const slotDate = new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    return (
      isAfter(slotDate, minDate) &&
      isBefore(slotDate, maxDate) &&
      !isBefore(slotDate, new Date())
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Appointment Date & Time
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted">
              <Calendar className="w-4 h-4" />
              <span>Select Date</span>
            </div>
            <input
              type="date"
              value={format(value, 'yyyy-MM-dd')}
              min={format(minDate, 'yyyy-MM-dd')}
              max={format(maxDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                newDate.setHours(value.getHours(), value.getMinutes());
                onChange(newDate);
              }}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted">
              <Clock className="w-4 h-4" />
              <span>Select Time</span>
            </div>
            <select
              value={format(value, 'HH:mm')}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const newDate = new Date(value);
                newDate.setHours(hours, minutes);
                onChange(newDate);
              }}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              {timeSlots.map((time) => {
                const isAvailable = isTimeSlotAvailable(time);
                return (
                  <option
                    key={format(time, 'HH:mm')}
                    value={format(time, 'HH:mm')}
                    disabled={!isAvailable}
                  >
                    {format(time, 'h:mm a')}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker;