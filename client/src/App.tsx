import React from "react";
import { StarknetProvider } from "./context/StarknetProvider";
import { ConnectWallet } from "./components/ConnectWallet";
import { Spawn } from "./components/Spawn";
import { useState } from "react";
import { ControllerConnector } from "@cartridge/connector";
import { RpcProvider } from "starknet";
import { Unity, useUnityContext } from "react-unity-webgl";
import { Play } from "./components/Play";

function App() {
  const [controller, setController] = useState<ControllerConnector | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const provider = new RpcProvider({ nodeUrl: "https://api.cartridge.gg/x/testBrentimus/katana" });
  const { unityProvider } = useUnityContext({
    loaderUrl: "build/checkers.loader.js",
    dataUrl: "build/checkers.data.unityweb",
    frameworkUrl: "build/checkers.framework.js.unityweb",
    codeUrl: "build/checkers.wasm.unityweb",
  }); 

  return (
    <StarknetProvider>
      <div style={{ display: 'flex' }}>
        <div style={{ 
          position: 'fixed', 
          left: 0, 
          top: 0,
          padding: '20px',
          zIndex: 2,
          marginRight: '500px'
        }}>
          <ConnectWallet setController={setController} />
          {controller && (
            <>
              <Spawn controller={controller} provider={provider} />
              <Play controller={controller} setIsPlaying={setIsPlaying} />
            </>
          )}
        </div>
        {isPlaying && (
          <Unity 
            unityProvider={unityProvider} 
            style={{
              width: '60vw',
              height: '60vw',
              maxHeight: '90vh',
              maxWidth: '90vh',
              marginLeft: '500px',
              marginRight: '20px',
              marginTop: '80px',
              zIndex: 1
            }}
          />
        )}
      </div>
    </StarknetProvider>
  );
}

export default App;
