import { create } from 'zustand';

interface CanvasStore {
  activeEquation: string | null;
  triggerPlot: (equation: string) => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  activeEquation: null,
  triggerPlot: (equation) => set({ activeEquation: equation }),
  clearCanvas: () => set({ activeEquation: null }),
}));