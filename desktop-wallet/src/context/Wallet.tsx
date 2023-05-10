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
  addresses: string[];
  createAddress: (isChange: boolean) => void;
}

const WalletContext = createContext<IWalletContext>({} as IWalletContext);

const descriptor = `wpkh(@0/**)`;

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { query } = useTransport();
  const { fingerprint } = useFingerprint();
  const { path } = useBlockbook();

  const [addresses, setAddresses] = useState<string[]>([]);
  const [changeAddresses, setChangeAddresses] = useState<string[]>([]);

  const createAddress = useCallback(
    (isChange: boolean) => {
      query("getXpub", path).then(([xpub]) => {
        query(
          "getAddress",
          fingerprint,
          xpub,
          path,
          descriptor,
          isChange ? 1 : 0,
          isChange ? changeAddresses.length : addresses.length
        ).then((params: string[]) => {
          if (params.length === 0) {
            return;
          }
          if (isChange) {
            setChangeAddresses((changeAddresses) => [
              ...changeAddresses,
              params[0],
            ]);
          } else {
            setAddresses((addresses) => [...addresses, params[0]]);
          }
        });
      });
    },
    [fingerprint, path, query, addresses, changeAddresses]
  );

  const value = useMemo(
    () => ({
      addresses,
      createAddress,
    }),
    [fingerprint, path, addresses]
  );

  useEffect(() => {
    if (!fingerprint) {
      return;
    }
    query("getLocalWallet").then((params) => {
      const localWallet: ILocalWallet = params[0];
      if (!localWallet) {
        return;
      }
      setAddresses(localWallet.addresses);
      setChangeAddresses(localWallet.changeAddresses);
    });
  }, []);

  useEffect(() => {
    query("saveLocalWallet", { addresses, changeAddresses });
  }, [addresses, changeAddresses]);

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
