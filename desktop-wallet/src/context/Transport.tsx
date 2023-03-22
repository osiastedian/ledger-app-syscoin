import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

declare global {
  interface Window {
    LEDGER_API: {
      onMessage: (cb: (sender: any, ...args: any[]) => void) => void;
      onceMessage: (cb: (sender: any, ...args: any[]) => void) => void;
      request: (method: string, ...args: any[]) => void;
    };
  }
}

type Query = <T = any[]>(query: string, ...args: any[]) => Promise<T>;

interface ITransportContext {
  isConnected: boolean;
  checkConnection: () => void;
  query: Query;
}

const TransportContext = createContext<ITransportContext>({
  isConnected: false,
} as ITransportContext);

export const useTransport = () => useContext(TransportContext);

export const TransportProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);

  const onMessage = useCallback(
    (_: any, ...args: any[]) => {
      const [message, ...params] = args;
      console.log({ message, params });
      if (message === "connected") {
        const [connected] = params;
        setIsConnected(connected);
      }
    },
    [setIsConnected]
  );

  const checkConnection = () => {
    window.LEDGER_API.request("checkConnection");
  };

  function query<T = any[]>(queryKey: string, ...args: any[]) {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject("Timeout");
      }, 100_000);
      window.LEDGER_API.onceMessage((_, ...args) => {
        const [method, ...params] = args;
        if (method === queryKey) {
          resolve(params as T);
          clearTimeout(timeout);
        }
      });
      window.LEDGER_API.request(queryKey, ...args);
    });
  }

  useEffect(() => {
    window.LEDGER_API.onMessage(onMessage);
    checkConnection();
  }, []);

  return (
    <TransportContext.Provider
      value={{
        isConnected,
        checkConnection,
        query,
      }}
    >
      {children}
    </TransportContext.Provider>
  );
};
