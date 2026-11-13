"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { initialSession, reduceSession, type Command, type SessionState } from "@/lib/commerce";

type SessionStore = {
  state: SessionState;
  dispatch: (command: Command) => void;
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      state: initialSession(),
      dispatch: (command) => set({ state: reduceSession(get().state, command) }),
    }),
    {
      name: "deskdash-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (store) => ({ state: store.state }),
      skipHydration: true,
    },
  ),
);

export function useSession() {
  return useSessionStore((store) => store.state);
}

export function useDispatch() {
  return useSessionStore((store) => store.dispatch);
}
