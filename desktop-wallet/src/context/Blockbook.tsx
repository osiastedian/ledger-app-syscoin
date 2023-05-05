import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { BlockbookUTXO } from "../types/BlockbookUTXO";
import { useFingerprint } from "./Fingerprint";
import { useTransport } from "./Transport";

type BlockbookApiGetXpub = {
  page: number;
  totalPages: number;
  itemsOnPage: number;
  address: string;
  balance: string;
  totalReceived: string;
  totalSent: string;
  unconfirmedBalance: string;
  unconfirmedTxs: number;
  txs: number;
  txids: string[];
  usedTokens: number;
  tokens: {
    type: string;
    name: string;
    path: string;
    transfers: number;
    decimals: number;
    balance: string;
    totalReceived: string;
    totalSent: string;
  }[];
};

type UTXOPayload = {
  utxos: BlockbookUTXO[];
};

interface IBlockbookContext {
  xpub: BlockbookApiGetXpub;
  path: string;
  sendAmount: (toAddress: string, amount: string) => void;
}

const BlockbookContext = createContext({} as IBlockbookContext);

export const useBlockbook = () => useContext(BlockbookContext);

const path = `m/84'/57'/0'`;

type BlockbookProviderProps = {
  children: React.ReactNode;
};

export const BlockbookProvider: React.FC<BlockbookProviderProps> = ({
  children,
}) => {
  const { fingerprint } = useFingerprint();
  const { query } = useTransport();
  const getDescriptor = (xpub: string) => {
    return `wpkh([${path.replace("m", fingerprint)}]${xpub})`;
  };
  const xpub = useQuery(["xpub", path], {
    queryFn: async () => {
      const xpubValue = await query("getXpub", path).then(
        (params: string[]) => {
          if (params.length === 0) {
            return undefined;
          }
          return params[0];
        }
      );
      return xpubValue;
    },
    enabled: Boolean(fingerprint),
  });
  const xpubQuery = useQuery(["blockbook", "xpub", path], {
    queryFn: async () => {
      const xpubValue = xpub.data;
      const descriptor = getDescriptor(xpubValue);
      const url = `https://blockbook.elint.services/api/v2/xpub/${descriptor}`;
      const fetchVal: BlockbookApiGetXpub = await fetch(url).then((resp) =>
        resp.json()
      );
      return fetchVal;
    },
    enabled: xpub.isSuccess,
  });

  const utxos = useQuery(["utxo", path], {
    queryFn: async () => {
      const xpubValue = xpub.data;
      const descriptor = getDescriptor(xpubValue);
      const url = `https://blockbook.elint.services/api/v2/utxo/${descriptor}`;
      const resp: UTXOPayload = await fetch(url).then((resp) => resp.json());
      return resp.utxos;
    },
    enabled: xpubQuery.isSuccess,
  });

  const sendAmount = (toAddress: string, amount: string) => {
    query(
      "signPsbt",
      fingerprint,
      xpub.data,
      path,
      "wpkh(@0/**)",
      toAddress,
      amount,
      utxos.data
    ).then((data) => {
      console.log("Send Amount", { data });
      const url = "https://blockbook.elint.services/api/v2/sendtx/";
      return fetch(url, { method: "POST", body: data[0] });
    });
  };

  return (
    <BlockbookContext.Provider
      value={{
        xpub: xpubQuery.isSuccess ? xpubQuery.data : undefined,
        path,
        sendAmount,
      }}
    >
      {children}
    </BlockbookContext.Provider>
  );
};
