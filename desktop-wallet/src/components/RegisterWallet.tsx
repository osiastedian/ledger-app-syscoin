import { useState } from "react";
import { useFingerprint } from "../context/Fingerprint";
import { useTransport } from "../context/Transport";

type RegisterWalletProps = {
  xpub: string;
  path: string;
};

export const RegisterWallet: React.FC<RegisterWalletProps> = ({
  xpub,
  path,
}) => {
  const { query } = useTransport();
  const { fingerprint } = useFingerprint();
  const [walletName, setWalletName] = useState("My new Wallet");

  const [descriptor, setDescriptor] = useState("wsh(@0/**)");

  const [walletid, setWalletId] = useState("");
  const [walletHMAC, setWalletHMAC] = useState("");
  const [error, setError] = useState<string>();

  const disabled = !walletName;

  const registerWallet = () => {
    setError(undefined);
    setWalletId("");
    setWalletHMAC("");
    query("registerWallet", fingerprint, xpub, path, descriptor, walletName)
      .then(([params]: string[][]) => {
        if (params.length === 0) {
          return;
        }
        setWalletId(JSON.stringify(params[0]));
        setWalletHMAC(JSON.stringify(params[1]));
      })
      .catch((e) => setError(e));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    registerWallet();
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="walletName">Wallet Name:</label>
          <input
            type="text"
            name="walletName"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
          ></input>
        </div>

        <div>
          <label htmlFor="newWalletDescriptor">Descriptor:</label>
          <input
            type="text"
            name="newWalletDescriptor"
            value={descriptor}
            onChange={(e) => setDescriptor(e.target.value)}
          ></input>
        </div>
        <button type="submit" disabled={disabled}>
          Register New Wallet
        </button>
      </form>
      <div>
        <span>Wallet ID:</span>
        <span style={{ display: "block" }}>{walletid}</span>
        <span>Wallet HMAC:</span>
        <span style={{ display: "block" }}>{walletHMAC}</span>

        {error && (
          <span style={{ display: "block", color: "red" }}>{error}</span>
        )}
      </div>
    </div>
  );
};
