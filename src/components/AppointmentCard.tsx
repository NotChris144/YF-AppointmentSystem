import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Phone, Mail, Thermometer } from 'lucide-react';
import type { Appointment } from '../types/appointment';
import { cn } from '../lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange: (status: Appointment['status']) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onStatusChange,
}) => {
  const statusColors = {
    scheduled: 'bg-primary text-white',
    completed: 'bg-success text-white',
    cancelled: 'bg-error text-white',
  };

  const temperatureColors = {
    cold: 'text-blue-500',
    warm: 'text-warning',
    hot: 'text-success',
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {appointment.customerInfo.firstName} {appointment.customerInfo.lastName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted mt-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(appointment.scheduledFor), 'PPP')}</span>
            <Clock className="w-4 h-4 ml-2" />
            <span>{format(new Date(appointment.scheduledFor), 'p')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            statusColors[appointment.status]
          )}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
          <div className="flex items-center gap-1">
            <Thermometer className={cn("w-4 h-4", temperatureColors[appointment.temperature])} />
            <span className="text-sm">
              {appointment.score}/{appointment.maxScore}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted">
            <MapPin className="w-4 h-4" />
            <span>{appointment.customerInfo.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            {appointment.customerInfo.contactType === 'phone' ? (
              <Phone className="w-4 h-4" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            <span>{appointment.customerInfo.contactValue}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-muted">
            Current Provider: {appointment.providerDetails.name}
          </div>
          {appointment.selectedPackage && (
            <div className="text-muted">
              Selected Package: {appointment.selectedPackage.speed} Mbps
            </div>
          )}
        </div>
      </div>

      {appointment.status === 'scheduled' && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={() => onStatusChange('completed')}
            className="px-3 py-1 bg-success/20 text-success text-sm rounded-md hover:bg-success/30 transition-colors"
          >
            Mark Complete
          </button>
          <button
            onClick={() => onStatusChange('cancelled')}
            className="px-3 py-1 bg-error/20 text-error text-sm rounded-md hover:bg-error/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;