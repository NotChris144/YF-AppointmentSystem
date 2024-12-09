import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, RefreshCw, ArrowRight, Filter } from 'lucide-react';
import { useAppointmentStore } from '../store/appointmentStore';
import AppointmentCard from '../components/AppointmentCard';
import type { Appointment } from '../types/appointment';

const HomePage: React.FC = () => {
  const { appointments, updateAppointmentStatus } = useAppointmentStore();
  const [statusFilter, setStatusFilter] = useState<Appointment['status'] | 'all'>('scheduled');

  const filteredAppointments = appointments.filter(
    apt => statusFilter === 'all' || apt.status === statusFilter
  );

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Streamline Your Door-to-Door Sales</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Efficiently manage appointments and track leads with our comprehensive booking system
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link
          to="/lead"
          className="group p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-primary" />
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h2 className="text-xl font-semibold mb-2">New Lead</h2>
          <p className="text-gray-400">Book a new appointment for potential customers</p>
        </Link>

        <Link
          to="/revisit"
          className="group p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <RefreshCw className="w-8 h-8 text-primary" />
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Revisit</h2>
          <p className="text-gray-400">Schedule a follow-up with existing customers</p>
        </Link>
      </div>

      <section className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Upcoming Appointments</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Appointment['status'] | 'all')}
              className="bg-background border border-input rounded-md px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusChange={(status) => updateAppointmentStatus(appointment.id, status)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted">
              No appointments found
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;