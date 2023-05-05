import { createContext, useContext, useEffect, useState } from "react";
import { useTransport } from "../context/Transport";

const FingerPrintContext = createContext({
  fingerprint: undefined,
});

export const useFingerprint = () => useContext(FingerPrintContext);

export const FingerPrintProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isConnected, query } = useTransport();
  const [fingerprint, setFingerprint] = useState<string>();

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    query("getMasterFingerprint").then((params: string[]) => {
      if (params.length === 0) {
        return;
      }
      console.log({ fingerprint: params[0] });
      setFingerprint(params[0]);
    });
  }, [isConnected]);

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
