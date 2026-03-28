import { createContext, useContext } from "react";

const SsrDataContext = createContext({});

export function SsrDataProvider({ children, initialData = {} }) {
  return (
    <SsrDataContext.Provider value={initialData || {}}>
      {children}
    </SsrDataContext.Provider>
  );
}

export function useSsrData() {
  return useContext(SsrDataContext);
}
