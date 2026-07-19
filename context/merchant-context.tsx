"use client";

import React, { createContext, useContext } from "react";
import { type Profile, type Store } from "@/features/auth/types";

interface MerchantContextType {
  profile: Profile;
  store: Store;
}

const MerchantContext = createContext<MerchantContextType | null>(null);

export function MerchantProvider({
  children,
  profile,
  store,
}: {
  children: React.ReactNode;
  profile: Profile;
  store: Store;
}) {
  return (
    <MerchantContext.Provider value={{ profile, store }}>
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error("useMerchant must be used within a MerchantProvider");
  }
  return context;
}
