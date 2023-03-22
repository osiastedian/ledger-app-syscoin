import { useState } from "react";
import { useTransport } from "../context/Transport";

type SignMessageProps = {
  path: string;
};

export const SignMessage: React.FC<SignMessageProps> = ({ path }) => {
  const { query } = useTransport();
  const [message, setMessage] = useState(`Hello World!`);
  const [signedMessage, setSignedMessage] = useState("");
  const [error, setError] = useState<string>();

  const disabled = !path || !message;

  const requestSignature = () => {
    setError(undefined);
    setSignedMessage("");
    query("signMessage", path, message)
      .then((params: string[]) => {
        if (params.length === 0) {
          return;
        }
        setSignedMessage(params[0]);
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
        <label htmlFor="message">Message</label>
        <input
          type="text"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></input>
        <button type="submit" disabled={disabled}>
          Sign
        </button>
      </form>
      <div>
        <span>Signed Message:</span>
        <span style={{ display: "block" }}>{signedMessage}</span>
        {error && (
          <span style={{ display: "block", color: "red" }}>{error}</span>
        )}
      </div>
    </div>
  );
};
