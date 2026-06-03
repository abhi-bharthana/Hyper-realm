import { create } from 'zustand';
import { api, API_URLS } from '@/lib/api';

export interface CalculationRecord {
  ID: number;
  hyperId: string;
  type: string;
  expression: string;
  result: string;
  CreatedAt: string;
}

interface CalculatorStore {
  history: CalculationRecord[];
  isLoading: boolean;
  
  // APIs
  fetchHistory: () => Promise<void>;
  saveCalculation: (type: string, expression: string, result: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  history: [],
  isLoading: false,

  fetchHistory: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get(`${API_URLS.OS}/os/calculator/history`);
      if (response.status === 'success') {
        set({ history: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch calculator history", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveCalculation: async (type, expression, result) => {
    try {
      const response = await api.post(`${API_URLS.OS}/os/calculator/history`, {
        type,
        expression,
        result
      });
      if (response.status === 'success') {
        // Local state turant update kar de taaki fast feel ho
        set((state) => ({ history: [response.data, ...state.history] }));
      }
    } catch (error) {
      console.error("Failed to save calculation", error);
    }
  },

  clearHistory: async () => {
    try {
      await api.delete(`${API_URLS.OS}/os/calculator/history`);
      set({ history: [] }); // UI se turant clear kar do
    } catch (error) {
      console.error("Failed to clear history", error);
    }
  }
}));