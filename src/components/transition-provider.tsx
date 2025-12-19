
"use client";

import { usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect } from 'react';

type TransitionContextType = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const TransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Hide loading on new page load
    setLoading(false);
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ loading, setLoading }}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransition = (): TransitionContextType => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
};
