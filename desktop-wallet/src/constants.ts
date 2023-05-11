export const BlockbookAPIURL = "https://blockbook.elint.services/";

export const SYSCOIN_NETWORK = {
  messagePrefix: "\x18Syscoin Signed Message:\n",
  bech32: "sys",
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x3f,
  scriptHash: 0x05,
  wif: 0x80,
};
