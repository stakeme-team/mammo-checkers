import { StarknetProvider } from "./context/StarknetProvider";
import { ConnectWallet } from "./components/ConnectWallet";
import { Spawn } from "./components/Spawn";
import { DojoContextProvider } from "./DojoContext";
import { useState } from "react";
import { ControllerConnector } from "@cartridge/connector";
import { RpcProvider } from "starknet";

function App() {
  const [controller, setController] = useState<ControllerConnector | null>(null);
  const provider = new RpcProvider({ nodeUrl: "https://api.cartridge.gg/x/testBrentimus/katana" });

  return (
    <DojoContextProvider>
      <StarknetProvider>
        <ConnectWallet setController={setController} />
        {controller && <Spawn controller={controller} provider={provider} />} 
      </StarknetProvider>
    </DojoContextProvider>
  );
}

export default App;
