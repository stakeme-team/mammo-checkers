import React from "react";
import { useCallback, useState, useEffect } from "react";
import { ControllerConnector } from "@cartridge/connector";
import { RpcProvider } from "starknet";

type SpawnProps = {
  controller: ControllerConnector;
  provider: RpcProvider; 
};

  export const Spawn = ({ controller, provider }: SpawnProps) => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    async function fetchAccount() {
      if (!controller) return;
      try {
        await controller.connect(); 
        const connectedAccount = await controller.account(provider); 
        if (!connectedAccount || !connectedAccount.execute) {
          console.error("Account is not valid:", connectedAccount);
          return;
        }
        setAccount(connectedAccount);
        console.log("Connected account:", connectedAccount);
      } catch (error) {
        console.error("Failed to connect controller:", error);
      }
    }

    fetchAccount();
  }, [controller, provider]);

  const execute = useCallback(async () => {
    try {
      if (!account || !account.execute) {
        console.error("Account is invalid or undefined!");
        return;
      }

      setSubmitted(true);

      const result = await account.execute([
        {
          contractAddress: "0x062f6a8b1bc8f4b45985eaff3b00f85f370d6eb8dcb038072f3bf34fba0dd855",
          entrypoint: "spawn",
          calldata: [],
        },
      ]);
      console.log(result)

    } catch (e) {
      console.error("Transaction failed:", e);
    } finally {
      setSubmitted(false);
    }
  }, [account]);

  if (!account) return <p>Connecting...</p>;

  return (
    <div>
      <h2>Spawn</h2>
      <button onClick={execute} disabled={submitted}>
        Spawn
      </button>
    </div>
  );
};
