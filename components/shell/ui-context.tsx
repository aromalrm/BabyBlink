"use client";

import { createContext, useContext } from "react";

export type UiApi = {
  openSearch: () => void;
  openCart: () => void;
  openArea: () => void;
  openDemo: () => void;
  toast: (message: string) => void;
  launch: (src: string, from: DOMRect) => void;
};

const UiContext = createContext<UiApi | null>(null);

export function UiProvider({ value, children }: { value: UiApi; children: React.ReactNode }) {
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const value = useContext(UiContext);
  if (!value) {
    throw new Error("BabyBlink controls are unavailable on this screen.");
  }
  return value;
}
