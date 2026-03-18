"use client";

import { createContext, useContext } from "react";

interface DomainContextValue {
  isPro: boolean;
}

const DomainContext = createContext<DomainContextValue>({ isPro: false });

export function DomainProvider({ isPro, children }: { isPro: boolean; children: React.ReactNode }) {
  return <DomainContext.Provider value={{ isPro }}>{children}</DomainContext.Provider>;
}

export function useDomain() {
  return useContext(DomainContext);
}
