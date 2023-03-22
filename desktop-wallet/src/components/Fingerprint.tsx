import { useFingerprint } from "../context/Fingerprint";

export const FingerPrint: React.FC = () => {
  const { fingerprint } = useFingerprint();

  return (
    <div>
      <span>Fingerprint: </span>
      <span style={{ display: "block" }}>{fingerprint}</span>
    </div>
  );
};
