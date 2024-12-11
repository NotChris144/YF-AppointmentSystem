import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PriceState {
  monthlyPrice: string;
  setMonthlyPrice: (price: string) => void;
}

export const usePriceStore = create<PriceState>()(
  persist(
    (set) => ({
      monthlyPrice: '0',
      setMonthlyPrice: (price) => set({ monthlyPrice: price }),
    }),
    {
      name: 'price-storage',
    }
  )
);
