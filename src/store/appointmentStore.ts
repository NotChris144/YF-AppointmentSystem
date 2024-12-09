import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Addon, Package } from '../types/packages';
import { CustomerInfo, ProviderDetails, Appointment, AppointmentType } from '../types/appointment';
import { calculateTemperature } from '../lib/saleTemperature';

interface AppointmentState {
  customerInfo: Partial<CustomerInfo>;
  providerDetails: Partial<ProviderDetails>;
  selectedPackage: Package | null;
  selectedAddons: Addon[];
  painPoints: string[];
  appointments: Appointment[];
  scheduledDate: Date;
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setProviderDetails: (details: Partial<ProviderDetails>) => void;
  setSelectedPackage: (pkg: Package) => void;
  toggleAddon: (addon: Addon) => void;
  togglePainPoint: (id: string) => void;
  setScheduledDate: (date: Date) => void;
  submitAppointment: (type: AppointmentType) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  reset: () => void;
}

const initialState = {
  customerInfo: {},
  providerDetails: {},
  selectedPackage: null,
  selectedAddons: [],
  painPoints: [],
  appointments: [],
  scheduledDate: new Date()
};

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setCustomerInfo: (info) =>
        set((state) => ({ customerInfo: { ...state.customerInfo, ...info } })),
      setProviderDetails: (details) =>
        set((state) => ({ providerDetails: { ...state.providerDetails, ...details } })),
      setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
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
      setScheduledDate: (date) => set({ scheduledDate: new Date(date) }),
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
          scheduledFor: new Date(state.scheduledDate),
          customerInfo: state.customerInfo as CustomerInfo,
          providerDetails: state.providerDetails as ProviderDetails,
          selectedPackage: state.selectedPackage || {
            id: 'default',
            name: 'Default Package',
            price: 0,
            speed: 0,
            description: '',
            features: []
          },
          selectedAddons: state.selectedAddons,
          painPoints: state.painPoints,
          temperature: result.temperature,
          score: result.totalScore,
          maxScore: result.maxScore,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => {
          // Ensure all dates are proper Date objects
          const sortedAppointments = [...state.appointments, appointment]
            .map(apt => ({
              ...apt,
              scheduledFor: new Date(apt.scheduledFor),
              createdAt: new Date(apt.createdAt),
              updatedAt: new Date(apt.updatedAt)
            }))
            .sort((a, b) => b.scheduledFor.getTime() - a.scheduledFor.getTime());

          return { appointments: sortedAppointments };
        });

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
      reset: () => set({ ...initialState, scheduledDate: new Date() }),
    }),
    {
      name: 'appointment-storage',
      serialize: (state) => {
        // Convert dates to ISO strings before storing
        const serializedState = {
          ...state,
          scheduledDate: state.scheduledDate ? state.scheduledDate.toISOString() : new Date().toISOString(),
          appointments: state.appointments.map(apt => ({
            ...apt,
            scheduledFor: apt.scheduledFor ? apt.scheduledFor.toISOString() : new Date().toISOString(),
            createdAt: apt.createdAt ? apt.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: apt.updatedAt ? apt.updatedAt.toISOString() : new Date().toISOString()
          }))
        };
        return JSON.stringify(serializedState);
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        // Convert ISO strings back to Date objects
        return {
          ...parsed,
          scheduledDate: new Date(parsed.scheduledDate || new Date()),
          appointments: (parsed.appointments || []).map(apt => ({
            ...apt,
            scheduledFor: new Date(apt.scheduledFor || new Date()),
            createdAt: new Date(apt.createdAt || new Date()),
            updatedAt: new Date(apt.updatedAt || new Date())
          }))
        };
      }
    }
  )
);
