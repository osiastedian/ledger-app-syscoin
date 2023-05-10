import { Button, Container } from "react-bootstrap";
import HomePage from "./components/Home/Home";
import { FingerPrintProvider } from "./context/Fingerprint";
import { TransportProvider, useTransport } from "./context/Transport";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BlockbookProvider } from "./context/Blockbook";
import { WalletProvider } from "./context/Wallet";

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
              <WalletProvider>
                <HomePage />
                {/* <TransferSend /> */}
              </WalletProvider>
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
