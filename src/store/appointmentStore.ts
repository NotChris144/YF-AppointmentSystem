import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Addon } from '../types/packages';
import { CustomerInfo, ProviderDetails, Appointment, AppointmentType } from '../types/appointment';
import { calculateTemperature } from '../lib/saleTemperature';

interface AppointmentState {
  customerInfo: Partial<CustomerInfo>;
  providerDetails: Partial<ProviderDetails>;
  selectedAddons: Addon[];
  painPoints: string[];
  appointments: Appointment[];
  scheduledDate: Date;
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setProviderDetails: (details: Partial<ProviderDetails>) => void;
  toggleAddon: (addon: Addon) => void;
  togglePainPoint: (id: string) => void;
  setScheduledDate: (date: Date) => void;
  submitAppointment: (type: AppointmentType) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  reset: () => void;
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      customerInfo: {},
      providerDetails: {},
      selectedAddons: [],
      painPoints: [],
      appointments: [],
      scheduledDate: new Date(),
      setCustomerInfo: (info) =>
        set((state) => ({ customerInfo: { ...state.customerInfo, ...info } })),
      setProviderDetails: (details) =>
        set((state) => ({ providerDetails: { ...state.providerDetails, ...details } })),
      toggleAddon: (addon) =>
        set((state) => ({
          selectedAddons: state.selectedAddons.some((a) => a.id === addon.id)
            ? state.selectedAddons.filter((a) => a.id !== addon.id)
            : [...state.selectedAddons, addon],
        })),
      togglePainPoint: (id) =>
        set((state) => ({
          painPoints: state.painPoints.includes(id)
            ? state.painPoints.filter((p) => p !== id)
            : [...state.painPoints, id],
        })),
      setScheduledDate: (date) => set({ scheduledDate: date }),
      submitAppointment: (type) => {
        const state = get();
        const result = calculateTemperature(
          state.customerInfo as CustomerInfo,
          state.providerDetails as ProviderDetails,
          state.painPoints,
          type
        );

        const appointment: Appointment = {
          id: uuidv4(),
          type,
          status: 'scheduled',
          scheduledFor: state.scheduledDate,
          customerInfo: state.customerInfo as CustomerInfo,
          providerDetails: state.providerDetails as ProviderDetails,
          selectedAddons: state.selectedAddons,
          painPoints: state.painPoints,
          temperature: result.temperature,
          score: result.totalScore,
          maxScore: result.maxScore,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          appointments: [...state.appointments, appointment].sort((a, b) => 
            b.scheduledFor.getTime() - a.scheduledFor.getTime()
          ),
        }));

        get().reset();
      },
      updateAppointmentStatus: (id, status) =>
        set((state) => ({
          appointments: state.appointments.map((apt) =>
            apt.id === id
              ? { ...apt, status, updatedAt: new Date() }
              : apt
          ),
        })),
      reset: () => 
        set({ 
          customerInfo: {}, 
          providerDetails: {}, 
          selectedAddons: [],
          painPoints: [],
          scheduledDate: new Date(),
        }),
    }),
    {
      name: 'appointment-storage',
    }
  )
);
