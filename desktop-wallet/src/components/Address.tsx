import { useState } from "react";
import { useFingerprint } from "../context/Fingerprint";
import { useTransport } from "../context/Transport";
import { SignPsbt } from "./SignPsbt";

type AddressProps = {
  xpub: string;
  path: string;
};

export const Address: React.FC<AddressProps> = ({ xpub, path }) => {
  const { query } = useTransport();
  const { fingerprint } = useFingerprint();
  const [descriptor, setDescriptor] = useState(`wpkh(@0/**)`);
  const [change, setChange] = useState(0);
  const [index, setIndex] = useState(0);
  const [address, setAddress] = useState("");

  const disabled = !xpub || !path;

  const getAddress = () => {
    setAddress("");
    query(
      "getAddress",
      fingerprint,
      xpub,
      path,
      descriptor,
      change,
      index
    ).then((params: string[]) => {
      if (params.length === 0) {
        return;
      }
      setAddress(params[0]);
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    getAddress();
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="descriptor">Descriptor</label>
          <input
            type="text"
            name="descriptor"
            value={descriptor}
            onChange={(e) => setDescriptor(e.target.value)}
          ></input>
        </div>
        <div>
          <label htmlFor="change">Change</label>
          <input
            type="number"
            min={0}
            name="change"
            value={change}
            onChange={(e) => setChange(parseInt(e.target.value, 10))}
          ></input>
        </div>
        <div>
          <label htmlFor="index">Index</label>
          <input
            type="number"
            min={0}
            name="index"
            value={index}
            onChange={(e) => setIndex(parseInt(e.target.value, 10))}
          ></input>
        </div>
        <button type="submit" disabled={disabled}>
          Submit
        </button>
      </form>
      <div>
        <span>Address:</span>
        <span style={{ display: "block" }}>{address}</span>
      </div>

      <SignPsbt xpub={xpub} path={path} descriptor={descriptor} />
    </div>
  );
};
