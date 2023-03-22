import { FingerPrint } from "./components/Fingerprint";
import { Xpub } from "./components/Xpub";
import { FingerPrintProvider } from "./context/Fingerprint";
import { TransportProvider, useTransport } from "./context/Transport";

const ConnectedCheck = () => {
  const { isConnected } = useTransport();

  return <>{isConnected ? "Connected!" : "Not Connected. "}</>;
};

const App = () => {
  return (
    <TransportProvider>
      <ConnectedCheck />
      <FingerPrintProvider>
        <FingerPrint />
        <Xpub />
      </FingerPrintProvider>
    </TransportProvider>
  );
};

export default App;
