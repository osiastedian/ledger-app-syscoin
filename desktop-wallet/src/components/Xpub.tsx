import { useState } from "react";
import { useTransport } from "../context/Transport";
import { Address } from "./Address";
import { RegisterWallet } from "./RegisterWallet";
import { SignMessage } from "./SignMessage";

export const Xpub = () => {
  const { query } = useTransport();
  const [path, setPath] = useState(`m/84'/57'/0'`);
  const [xpub, setXpub] = useState("");

  const getXpub = () => {
    setXpub("");
    query("getXpub", path).then((params: string[]) => {
      if (params.length === 0) {
        return;
      }
      setXpub(params[0]);
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    getXpub();
  };

  return (
    <>
      <div style={{ marginTop: "1rem" }}>
        <form onSubmit={handleSubmit}>
          <label htmlFor="path">Path</label>
          <input
            type="text"
            name="path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          ></input>
          <button type="submit">Submit</button>
        </form>
        <div>
          <span>XPUB:</span>
          <span style={{ display: "block" }}>{xpub}</span>
        </div>
      </div>
      <Address path={path} xpub={xpub} />
      <SignMessage path={path} />
      <RegisterWallet path={path} xpub={xpub} />
    </>
  );
};
