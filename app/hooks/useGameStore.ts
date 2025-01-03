// app/store/useGameStore.ts
import { create } from "zustand";

export type User = {
  id: number;
  name: string;
  balance: number;
  guess?: number;  // guess for current question
  hasGuessed: boolean;
  folded: boolean;
};

export type RoundPhase =
  | "guessing"
  | "bet1"
  | "hint1"
  | "bet2"
  | "hint2"
  | "bet3"
  | "answer";

type GameState = {
  users: User[];
  currentDealerIndex: number;
  actionIndex: number;
  currentQuestionIndex: number;
  roundPhase: RoundPhase;

  pot: number;
  currentBet: number;
  checkCount: number;

  addUser: (name: string, balance: number) => void;
  startNewQuestion: () => void;
  nextPhase: () => void;

  setGuess: (guessValue: number) => void;
  check: () => void;
  bet: (amount: number) => void;
  fold: () => void;

  awardWinner: (questionAnswer: number) => void;
};

let userIdCounter = 1;

export const useGameStore = create<GameState>((set, get) => ({
  users: [],
  currentDealerIndex: 0,
  actionIndex: 0,
  currentQuestionIndex: 0,
  roundPhase: "guessing",
  pot: 0,
  currentBet: 0,
  checkCount: 0,

  addUser: (name, balance) => {
    const newUser = {
      id: userIdCounter++,
      name,
      balance,
      guess: undefined,
      hasGuessed: false,
      folded: false,
    };
    set((state) => ({ users: [...state.users, newUser] }));
  },

  startNewQuestion: () => {
    const st = get();
    const newDealer = (st.currentDealerIndex + 1) % st.users.length;
    const nextActing = (newDealer + 1) % st.users.length;

    set({
      currentQuestionIndex: st.currentQuestionIndex + 1,
      currentDealerIndex: newDealer,
      actionIndex: nextActing,
      roundPhase: "guessing",
      pot: 0,
      currentBet: 0,
      checkCount: 0,
      users: st.users.map((u) => ({
        ...u,
        guess: undefined,
        hasGuessed: false,
        folded: false,
      })),
    });
  },

  nextPhase: () => {
    const st = get();
    switch (st.roundPhase) {
      case "guessing":
        set({ roundPhase: "bet1", currentBet: 0, pot: 0, checkCount: 0 });
        break;
      case "bet1":
        set({ roundPhase: "hint1" });
        break;
      case "hint1":
        set({ roundPhase: "bet2", checkCount: 0 });
        break;
      case "bet2":
        set({ roundPhase: "hint2" });
        break;
      case "hint2":
        set({ roundPhase: "bet3", checkCount: 0 });
        break;
      case "bet3":
        set({ roundPhase: "answer" });
        break;
      case "answer":
        // done, presumably call startNewQuestion() from UI
        break;
    }
  },

  // The user at actionIndex sets guess
  setGuess: (guessValue) => {
    const st = get();
    const idx = st.actionIndex;
    const currentUser = st.users[idx];

    if (currentUser.folded || currentUser.hasGuessed) return;

    const newUsers = [...st.users];
    newUsers[idx] = {
      ...currentUser,
      guess: guessValue,
      hasGuessed: true,
    };
    set({ users: newUsers });

    // Move to the next user who hasn't guessed/folded
    let nextIndex = (idx + 1) % st.users.length;
    for (let i = 0; i < st.users.length; i++) {
      const u = newUsers[nextIndex];
      if (!u.hasGuessed && !u.folded) {
        set({ actionIndex: nextIndex });
        return;
      }
      nextIndex = (nextIndex + 1) % st.users.length;
    }

    // Everyone guessed
    st.nextPhase();
  },

  check: () => {
    const st = get();
    const idx = st.actionIndex;
    const user = st.users[idx];
    if (user.folded) return;

    if (st.currentBet > 0) {
      console.log(`${user.name} can't check because there's a bet in place.`);
      return;
    }

    const newCheckCount = st.checkCount + 1;
    set({ checkCount: newCheckCount });

    const activePlayers = st.users.filter((u) => !u.folded).length;
    if (newCheckCount >= activePlayers) {
      st.nextPhase();
      return;
    }

    let nextIndex = (idx + 1) % st.users.length;
    set({ actionIndex: nextIndex });
  },

  bet: (amount) => {
    const st = get();
    const idx = st.actionIndex;
    const user = st.users[idx];
    if (user.folded) return;

    if (user.balance < amount) {
      console.log(`${user.name} doesn't have enough balance`);
      return;
    }

    const newUsers = [...st.users];
    newUsers[idx] = { ...user, balance: user.balance - amount };
    const newPot = st.pot + amount;
    const newBet = Math.max(st.currentBet, amount);

    set({
      users: newUsers,
      pot: newPot,
      currentBet: newBet,
      checkCount: 0,
    });

    let nextIndex = (idx + 1) % st.users.length;
    set({ actionIndex: nextIndex });
  },

  fold: () => {
    const st = get();
    const idx = st.actionIndex;
    const user = st.users[idx];
    if (user.folded) return;

    const newUsers = [...st.users];
    newUsers[idx] = { ...user, folded: true };
    set({ users: newUsers });

    // If only 1 user remains => skip to answer
    const active = newUsers.filter((u) => !u.folded).length;
    if (active <= 1) {
      set({ roundPhase: "answer" });
    } else {
      let nextIndex = (idx + 1) % st.users.length;
      set({ actionIndex: nextIndex });
    }
  },

  awardWinner: (questionAnswer) => {
    const st = get();
    const { users, pot, roundPhase } = st;
    if (roundPhase !== "answer") return;

    const active = users.filter((u) => !u.folded);
    if (active.length === 0) {
      return;
    }
    if (active.length === 1) {
      const winner = active[0];
      const newUsers = users.map((u) =>
        u.id === winner.id ? { ...u, balance: u.balance + pot } : u
      );
      set({ users: newUsers, pot: 0 });
      return;
    }

    let minDist = Number.POSITIVE_INFINITY;
    for (const u of active) {
      const dist = Math.abs((u.guess ?? 99999999) - questionAnswer);
      if (dist < minDist) minDist = dist;
    }
    const winners = active.filter((u) => {
      const dist = Math.abs((u.guess ?? 99999999) - questionAnswer);
      return dist === minDist;
    });
    const share = pot / winners.length;
    const newUsers = users.map((u) => {
      if (winners.some((w) => w.id === u.id)) {
        return { ...u, balance: u.balance + share };
      }
      return u;
    });
    set({ users: newUsers, pot: 0 });
  },
}));
