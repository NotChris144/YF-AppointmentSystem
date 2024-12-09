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
  appointments: [] as Appointment[],
  scheduledDate: new Date()
};

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setCustomerInfo: (info) => {
        console.log('Setting customer info:', info);
        set((state) => ({ customerInfo: { ...state.customerInfo, ...info } }));
      },
      setProviderDetails: (details) => {
        console.log('Setting provider details:', details);
        set((state) => ({ providerDetails: { ...state.providerDetails, ...details } }));
      },
      setSelectedPackage: (pkg) => {
        console.log('Setting selected package:', pkg);
        set({ selectedPackage: pkg });
      },
      toggleAddon: (addon) => {
        console.log('Toggling addon:', addon);
        set((state) => ({
          selectedAddons: state.selectedAddons.some((a) => a.id === addon.id)
            ? state.selectedAddons.filter((a) => a.id !== addon.id)
            : [...state.selectedAddons, addon],
        }));
      },
      togglePainPoint: (id) => {
        console.log('Toggling pain point:', id);
        set((state) => ({
          painPoints: state.painPoints.includes(id)
            ? state.painPoints.filter((p) => p !== id)
            : [...state.painPoints, id],
        }));
      },
      setScheduledDate: (date) => {
        console.log('Setting scheduled date:', date);
        try {
          const newDate = new Date(date);
          console.log('Parsed date:', newDate);
          set({ scheduledDate: newDate });
        } catch (err) {
          console.error('Error setting scheduled date:', err);
          set({ scheduledDate: new Date() });
        }
      },
      submitAppointment: (type) => {
        console.log('Submitting appointment of type:', type);
        const state = get();
        console.log('Current state:', {
          customerInfo: state.customerInfo,
          providerDetails: state.providerDetails,
          selectedPackage: state.selectedPackage,
          selectedAddons: state.selectedAddons,
          painPoints: state.painPoints,
          scheduledDate: state.scheduledDate,
          appointments: state.appointments || []
        });

        try {
          const result = calculateTemperature(
            state.customerInfo as CustomerInfo,
            state.providerDetails as ProviderDetails,
            state.painPoints,
            type
          );

          console.log('Temperature calculation result:', result);

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
            selectedAddons: state.selectedAddons || [],
            painPoints: state.painPoints || [],
            temperature: result.temperature,
            score: result.totalScore,
            maxScore: result.maxScore,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          console.log('Created appointment:', appointment);

          set((state) => {
            try {
              const currentAppointments = state.appointments || [];
              console.log('Current appointments:', currentAppointments);

              // Ensure all dates are proper Date objects
              const sortedAppointments = [...currentAppointments, appointment]
                .map(apt => {
                  try {
                    return {
                      ...apt,
                      scheduledFor: new Date(apt.scheduledFor),
                      createdAt: new Date(apt.createdAt),
                      updatedAt: new Date(apt.updatedAt)
                    };
                  } catch (err) {
                    console.error('Error parsing appointment dates:', err);
                    return {
                      ...apt,
                      scheduledFor: new Date(),
                      createdAt: new Date(),
                      updatedAt: new Date()
                    };
                  }
                })
                .sort((a, b) => b.scheduledFor.getTime() - a.scheduledFor.getTime());

              console.log('Sorted appointments:', sortedAppointments);
              return { appointments: sortedAppointments };
            } catch (err) {
              console.error('Error updating appointments:', err);
              return { ...state, appointments: [appointment] };
            }
          });

          console.log('Appointment submitted successfully');
          get().reset();
        } catch (err) {
          console.error('Error in submitAppointment:', err);
          throw err;
        }
      },
      updateAppointmentStatus: (id, status) => {
        console.log('Updating appointment status:', { id, status });
        set((state) => ({
          appointments: (state.appointments || []).map((apt) =>
            apt.id === id
              ? { ...apt, status, updatedAt: new Date() }
              : apt
          ),
        }));
      },
      reset: () => {
        console.log('Resetting store to initial state');
        try {
          const newState = { 
            ...initialState, 
            scheduledDate: new Date(),
            appointments: get().appointments || [] // Keep existing appointments
          };
          console.log('New state after reset:', newState);
          set(newState);
        } catch (err) {
          console.error('Error resetting store:', err);
          set({ ...initialState, appointments: [] });
        }
      },
    }),
    {
      name: 'appointment-storage',
      serialize: (state) => {
        console.log('Serializing state:', state);
        try {
          // Convert dates to ISO strings before storing
          const serializedState = {
            ...state,
            scheduledDate: state.scheduledDate ? state.scheduledDate.toISOString() : new Date().toISOString(),
            appointments: (state.appointments || []).map(apt => {
              try {
                return {
                  ...apt,
                  scheduledFor: apt.scheduledFor ? apt.scheduledFor.toISOString() : new Date().toISOString(),
                  createdAt: apt.createdAt ? apt.createdAt.toISOString() : new Date().toISOString(),
                  updatedAt: apt.updatedAt ? apt.updatedAt.toISOString() : new Date().toISOString()
                };
              } catch (err) {
                console.error('Error serializing appointment:', err);
                return {
                  ...apt,
                  scheduledFor: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
              }
            })
          };
          console.log('Serialized state:', serializedState);
          return JSON.stringify(serializedState);
        } catch (err) {
          console.error('Error in serialize:', err);
          return JSON.stringify({ ...initialState, appointments: [] });
        }
      },
      deserialize: (str) => {
        console.log('Deserializing string:', str);
        try {
          const parsed = JSON.parse(str);
          console.log('Parsed state:', parsed);
          
          // Convert ISO strings back to Date objects
          const deserialized = {
            ...parsed,
            scheduledDate: new Date(parsed.scheduledDate || new Date()),
            appointments: (parsed.appointments || []).map(apt => {
              try {
                return {
                  ...apt,
                  scheduledFor: new Date(apt.scheduledFor || new Date()),
                  createdAt: new Date(apt.createdAt || new Date()),
                  updatedAt: new Date(apt.updatedAt || new Date())
                };
              } catch (err) {
                console.error('Error deserializing appointment:', err);
                return {
                  ...apt,
                  scheduledFor: new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
              }
            })
          };
          console.log('Deserialized state:', deserialized);
          return deserialized;
        } catch (err) {
          console.error('Error in deserialize:', err);
          return { ...initialState, appointments: [] };
        }
      }
    }
  )
);
