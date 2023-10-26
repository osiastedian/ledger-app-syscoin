import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useFingerprint } from "./Fingerprint";
import { useBlockbook } from "./Blockbook";
import { useTransport } from "./Transport";

interface ILocalWallet {
  addresses: string[];
  changeAddresses: string[];
}

interface IWalletContext {
  getLatestAddress: (isChange: boolean) => Promise<string>;
}

const WalletContext = createContext<IWalletContext>({} as IWalletContext);

const descriptor = `wpkh(@0/**)`;

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { query } = useTransport();
  const { fingerprint } = useFingerprint();
  const { xpub, path } = useBlockbook();

  const getLatestAddress = useCallback(
    (isChange: boolean) => {
      return query("getXpub", path).then(([xpubStr]) => {
        return query(
          "getAddress",
          fingerprint,
          xpubStr,
          path,
          descriptor,
          isChange ? 1 : 0,
          isChange ? xpub.txs : 0
        ).then((params: string[]) => {
          if (params.length === 0) {
            return;
          }
          return params[0];
        });
      });
    },
    [fingerprint, path, query, xpub]
  );

  const value = useMemo(
    () => ({
      getLatestAddress,
    }),
    [getLatestAddress]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
