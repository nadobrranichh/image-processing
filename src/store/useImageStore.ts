import { create } from "zustand";
import type { Cell } from "../training-gen";

type ImageStoreProps = {
  hasSubmitted: boolean;
  referenceCanvas: HTMLCanvasElement | null;
  analyzeCanvas: HTMLCanvasElement | null;
  resultCanvas: HTMLCanvasElement | null;
  defects: Cell[] | null;
  setReferenceCanvas: (referenceCanvas: HTMLCanvasElement | null) => void;
  setAnalyzeCanvas: (analyzeCanvas: HTMLCanvasElement | null) => void;
  setResultCanvas: (resultCanvas: HTMLCanvasElement | null) => void;
  submit: () => void;
  setDefects: (defects: Cell[]) => void;
  reset: () => void;
};

const useImageStore = create<ImageStoreProps>((set) => ({
  hasSubmitted: false,
  referenceCanvas: null,
  resultCanvas: null,
  analyzeCanvas: null,
  defects: null,
  setReferenceCanvas(referenceCanvas: HTMLCanvasElement | null) {
    if (!referenceCanvas)
      set((state) => ({
        ...state,
        referenceCanvas,
        hasSubmitted: false,
        defects: null,
      }));
    else set((state) => ({ ...state, referenceCanvas }));
  },
  setAnalyzeCanvas(analyzeCanvas: HTMLCanvasElement | null) {
    if (!analyzeCanvas)
      set((state) => ({
        ...state,
        analyzeCanvas,
        hasSubmitted: false,
        defects: null,
      }));
    else set((state) => ({ ...state, analyzeCanvas }));
  },
  setResultCanvas(resultCanvas: HTMLCanvasElement | null) {
    set((state) => ({ ...state, resultCanvas }));
  },
  submit() {
    set((state) => {
      if (!state.referenceCanvas || !state.analyzeCanvas) return state;
      return { ...state, hasSubmitted: true, resultCanvas: null };
    });
  },
  setDefects(defects: any[]) {
    set((state) => ({ ...state, defects }));
  },
  reset() {
    set(() => ({
      hasSubmitted: false,
      referenceCanvas: null,
      analyzeCanvas: null,
      resultCanvas: null,
      defects: null,
    }));
  },
}));

export default useImageStore;
