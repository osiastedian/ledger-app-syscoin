export interface BlockbookUTXO {
  txid: string;
  vout: number;
  value: string;
  height: number;
  confirmations: number;
  address: string;
  path: string;
}

// Generated by https://quicktype.io

export interface BlockbookTransaction {
  txid: string;
  version: number;
  vin: Vin[];
  vout: Vout[];
  blockHash: string;
  blockHeight: number;
  confirmations: number;
  blockTime: number;
  value: string;
  valueIn: string;
  fees: string;
  hex: string;
}

export interface Vin {
  txid: string;
  sequence: number;
  n: number;
  addresses: string[];
  isAddress: boolean;
  value: string;
}

export interface Vout {
  value: string;
  n: number;
  hex: string;
  addresses: string[];
  isAddress: boolean;
}
