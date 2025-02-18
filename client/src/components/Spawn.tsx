import { useCallback, useState, useEffect } from "react";
import { useDojo } from "../hooks/useDojo.tsx";
import { ControllerConnector } from "@cartridge/connector";
import { RpcProvider } from "starknet";

type SpawnProps = {
  controller: ControllerConnector;
  provider: RpcProvider; 
};

export const Spawn = ({ controller, provider }: SpawnProps) => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [account, setAccount] = useState<any>(null);
  const { setupWorld } = useDojo();

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

      console.log("Executing transaction with account:", account);

      await account.execute([
        {
          contractAddress: "0x044b8cd097c84503c21a597e0370fd371b47e6f30de07db42e0bedd3fadf2420",
          entrypoint: "create_lobby",
          calldata: [],
        },
      ]);

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
