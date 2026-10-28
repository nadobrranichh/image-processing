import { create } from "zustand";

type ProgressStore = {
  preparation: number;
  training: number;
  finding: number;
  setPreparation: (value: number) => void;
  setTraining: (value: number) => void;
  setFinding: (value: number) => void;
  reset: () => void;
};

export const useProgressStore = create<ProgressStore>((set) => ({
  preparation: 0,
  training: 0,
  finding: 0,
  setPreparation(value) {
    set((state) => ({
      ...state,
      preparation: value,
    }));
  },
  setTraining(value) {
    set((state) => ({
      ...state,
      training: value,
    }));
  },
  setFinding(value) {
    set((state) => ({
      ...state,
      finding: value,
    }));
  },
  reset() {
    set(() => ({ preparation: 0, training: 0, finding: 0 }));
  },
}));
