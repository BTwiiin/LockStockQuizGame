import { create } from "zustand";

type State = {
  currentRound: number;
  currentQuestion: number;
};

type Actions = {
  reset: () => void;
  setQuestion: (newQuestionId: number) => void;
};

const initialState: State = {
  currentRound: 1,
  currentQuestion: 1,
};

export const useParamsStore = create<State & Actions>()((set) => ({
  ...initialState,
  reset: () => set(initialState),
  setQuestion: (newQuestionId) => set({ currentQuestion: newQuestionId }),
}));
