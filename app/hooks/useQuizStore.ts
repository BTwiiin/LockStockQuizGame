// store/useQuizStore.ts
import { create } from "zustand";

type Question = {
  id: number;
  text: string;
  hint1: string;
  hint2: string;
};

type QuizState = {
  questions: Question[];
  currentQuestionIndex: number;
  hintsShown: number;
  setQuestions: (q: Question[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setHintsShown: (count: number) => void;
  revealNextHintOrQuestion: () => void;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentQuestionIndex: 0,
  hintsShown: 0,

  // Actions
  setQuestions: (q) => set({ questions: q }),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setHintsShown: (count) => set({ hintsShown: count }),

  // Main logic for pressing Enter
  revealNextHintOrQuestion: () => {
    const { questions, currentQuestionIndex, hintsShown, setHintsShown, setCurrentQuestionIndex } = get();

    // If we have no questions loaded yet, do nothing
    if (questions.length === 0) return;

    const currentQuestion = questions[currentQuestionIndex];
    // We only have 2 hints in this model
    const totalHints = 2;

    // If there are more hints to reveal
    if (hintsShown < totalHints) {
      setHintsShown(hintsShown + 1);
    } else {
      // Move to the next question if possible
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setHintsShown(0); // reset hints for the next question
      } else {
        // No more questions
        alert("No more questions!");
      }
    }
  },
}));
