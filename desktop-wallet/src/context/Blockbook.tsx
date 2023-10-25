import { useMutation, useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import { BlockbookUTXO } from "../types/BlockbookUTXO";
import { useFingerprint } from "./Fingerprint";
import { useTransport } from "./Transport";
import { BlockbookAPIURL } from "../constants";

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
  send: (params: { toAddress: string; amount: string }) => Promise<string>;
  confirmTx: (txid: string) => Promise<boolean>;
}

const BlockbookContext = createContext({} as IBlockbookContext);

export const useBlockbook = () => useContext(BlockbookContext);

const script = "tr";
const path = `m/86'/57'/0'`;

type BlockbookProviderProps = {
  children: React.ReactNode;
};

export const BlockbookProvider: React.FC<BlockbookProviderProps> = ({
  children,
}) => {
  const { fingerprint } = useFingerprint();
  const { query } = useTransport();
  const getDescriptor = (xpub: string) => {
    return `${script}([${path.replace("m", fingerprint)}]${xpub})`;
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
      const url = `${BlockbookAPIURL}/api/v2/xpub/${descriptor}`;
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
      const url = `${BlockbookAPIURL}/api/v2/utxo/${descriptor}`;
      const resp: UTXOPayload = await fetch(url).then((resp) => resp.json());
      return resp.utxos;
    },
    enabled: xpubQuery.isSuccess,
  });

  const send = async (params: { toAddress: string; amount: string }) => {
    const { amount, toAddress } = params;
    const [tx] = await query(
      "signPsbt",
      fingerprint,
      xpub.data,
      path,
      `${script}(@0/**)`,
      toAddress,
      amount,
      utxos.data
    );
    const url = `${BlockbookAPIURL}/api/v2/sendtx/${tx.hex}`;
    return fetch(url)
      .then((resp) => resp.json())
      .then(({ result }) => result);
  };

  const confirmTx = async (txid: string) => {
    const url = `${BlockbookAPIURL}/api/v2/tx/${txid}`;
    const { confirmations } = await fetch(url).then((resp) => resp.json());

    return confirmations > 0;
  };

  const value = useMemo(
    () => ({
      xpub: xpubQuery.isSuccess ? xpubQuery.data : undefined,
      path,
      send,
      confirmTx,
    }),
    [send, xpubQuery.data, path]
  );

  return (
    <BlockbookContext.Provider value={value}>
      {children}
    </BlockbookContext.Provider>
  );
};
