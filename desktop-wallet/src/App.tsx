import { RouterProvider, createHashRouter } from "react-router-dom";
import { FingerPrintProvider } from "./context/Fingerprint";
import { TransportProvider } from "./context/Transport";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BlockbookProvider } from "./context/Blockbook";
import { WalletProvider } from "./context/Wallet";

import HomePage from "./components/Home/Home";
import TransferSend from "./components/Transfer/Send";
import TransferReceive from "./components/Transfer/Receive";
import ConnectedCheck from "./components/ConnectedCheck";

const queryClient = new QueryClient();
const router = createHashRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/send",
    element: <TransferSend />,
  },
  {
    path: "/receive",
    element: <TransferReceive />,
  },
]);

const App = () => {
  return (
    <div className="app-container bg-white m-auto p-3 rounded">
      <QueryClientProvider client={queryClient}>
        <TransportProvider>
          <ConnectedCheck />
          <FingerPrintProvider>
            <BlockbookProvider>
              <WalletProvider>
                <RouterProvider router={router} />
              </WalletProvider>
            </BlockbookProvider>
          </FingerPrintProvider>
        </TransportProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
