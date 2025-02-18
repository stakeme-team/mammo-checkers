import React from "react";
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core'
import { useEffect, useState } from 'react'
import ControllerConnector from '@cartridge/connector/controller'
 
type ConnectWalletProps = {
  setController: (controller: ControllerConnector) => void;
};

export function ConnectWallet({ setController }: ConnectWalletProps) {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const controller = connectors[0] as ControllerConnector;
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    if (!address) return;
    controller.username()?.then((n) => setUsername(n));
    setController(controller); 
  }, [address, controller, setController]);

  return (
    <div>
      {address && (
        <>
          <p>Account: {address}</p>
          {username && <p>Username: {username}</p>}
        </>
      )}
      {address ? (
        <button onClick={() => disconnect()}>Disconnect</button>
      ) : (
        <button onClick={() => connect({ connector: controller })}>Connect</button>
      )}
    </div>
  );
}