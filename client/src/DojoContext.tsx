import { createContext, ReactNode, useContext, useMemo } from "react";
import { Account } from "starknet";
import { dojoConfig } from "../dojoConfig";
import { DojoProvider } from "@dojoengine/core";
import { setupWorld } from "./contracts.gen";

interface DojoContextType {
    masterAccount: Account;
    setupWorld: ReturnType<typeof setupWorld>;
}

export const DojoContext = createContext<DojoContextType | null>(null);

export const DojoContextProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const currentValue = useContext(DojoContext);
    if (currentValue) throw new Error("DojoProvider can only be used once");

    const dojoProvider = new DojoProvider(
        dojoConfig.manifest,
        dojoConfig.rpcUrl
    );

    const masterAccount = useMemo(
        () => new Account(
            dojoProvider.provider,
            dojoConfig.masterAddress,
            dojoConfig.masterPrivateKey,
            "1"
        ),
        []
    );


    return (
        <DojoContext.Provider
            value={{
                masterAccount,
                setupWorld: setupWorld(dojoProvider),
                // account: {
                //     account: masterAccount,
                // },
            }}
        >
            {children}
        </DojoContext.Provider>
    );
};