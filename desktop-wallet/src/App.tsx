import { Button, Col, Container, Row } from "react-bootstrap";
import Balance from "./components/Home/Balance";
import { FingerPrint } from "./components/Fingerprint";
import HomePage from "./components/Home/Home";
import { Xpub } from "./components/Xpub";
import { FingerPrintProvider } from "./context/Fingerprint";
import { TransportProvider, useTransport } from "./context/Transport";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BlockbookProvider } from "./context/Blockbook";
import TransferSend from "./components/Transfer/Send";

const ConnectedCheck = () => {
  const { isConnected, checkConnection } = useTransport();

  if (isConnected) {
    return null;
  }

  return (
    <Container className="d-flex h-100">
      <Button
        size="lg"
        className="m-auto"
        onClick={() => {
          checkConnection();
        }}
      >
        Connect
      </Button>
    </Container>
  );
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <div className="app-container bg-white m-auto p-3 rounded">
      <QueryClientProvider client={queryClient}>
        <TransportProvider>
          <ConnectedCheck />
          <FingerPrintProvider>
            <BlockbookProvider>
              {/* <HomePage /> */}
              <TransferSend />
            </BlockbookProvider>
          </FingerPrintProvider>

          {/* <FingerPrintProvider>
          <FingerPrint />
          <Xpub />
        </FingerPrintProvider> */}
        </TransportProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
