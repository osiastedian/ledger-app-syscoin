import { createContext, useContext } from "react";
import { useTransport } from "../context/Transport";
import { useQuery } from "@tanstack/react-query";

const FingerPrintContext = createContext({
  fingerprint: undefined,
});

export const useFingerprint = () => useContext(FingerPrintContext);

export const FingerPrintProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isConnected, query } = useTransport();
  const { data: fingerprint } = useQuery(["fingerprint"], {
    queryFn: async () => {
      const [fingerprint]: [string] = await query("getMasterFingerprint");
      console.log({ fingerprint });
      return fingerprint;
    },
    enabled: isConnected,
  });

  if (!isConnected) {
    return null;
  }

  return (
    <FingerPrintContext.Provider
      value={{
        fingerprint,
      }}
    >
      {children}
    </FingerPrintContext.Provider>
  );
};
