import { createContext, useContext, useMemo, useState } from "react";
import { useFingerprint } from "./Fingerprint";
import { useBlockbook } from "./Blockbook";
import { useTransport } from "./Transport";

interface IWalletContext {
  addresses: string[];
  createAddress: (index: number, isChange: boolean) => void;
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

  const [addresses, setAddresses] = useState<string[]>([]);

  const createAddress = (index: number, isChange: boolean) => {
    query(
      "getAddress",
      fingerprint,
      xpub,
      path,
      descriptor,
      isChange,
      index
    ).then((params: string[]) => {
      if (params.length === 0) {
        return;
      }
    });
  };

  const value = useMemo(
    () => ({
      addresses,
      createAddress,
    }),
    [fingerprint, xpub, path, addresses]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
