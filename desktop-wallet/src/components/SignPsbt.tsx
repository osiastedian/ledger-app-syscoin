import { useState } from "react";
import { useFingerprint } from "../context/Fingerprint";
import { useTransport } from "../context/Transport";

type SignPsbtProps = {
  xpub: string;
  path: string;
  descriptor: string;
};

export const SignPsbt: React.FC<SignPsbtProps> = ({
  descriptor,
  xpub,
  path,
}) => {
  const { query } = useTransport();
  const { fingerprint } = useFingerprint();
  const [sysAddress, setSysaddress] = useState(
    "sys1q99uuuzgp4hh4wjhfvdejnx8s0efqeldytlhcsy"
  );

  const [signedPsbt, setSignedPsbt] = useState("");
  const [error, setError] = useState<string>();

  const disabled = !sysAddress;

  const requestSignature = () => {
    setError(undefined);
    setSignedPsbt("");
    query("signPsbt", fingerprint, xpub, path, descriptor, sysAddress)
      .then((params: [string, Buffer, Buffer]) => {
        setSignedPsbt(JSON.stringify(params));
      })
      .catch((e) => setError(e));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    requestSignature();
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="sysaddress">To:</label>
          <input
            type="text"
            name="sysaddress"
            value={sysAddress}
            onChange={(e) => setSysaddress(e.target.value)}
          ></input>
        </div>
        <button type="submit" disabled={disabled}>
          Sign PSBT
        </button>
      </form>
      <div>
        <span>Signed PSBT:</span>
        <span style={{ display: "block" }}>{signedPsbt}</span>
        {error && (
          <span style={{ display: "block", color: "red" }}>{error}</span>
        )}
      </div>
    </div>
  );
};
