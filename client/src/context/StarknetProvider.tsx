import React from "react";
import {StarknetConfig, starkscan} from "@starknet-react/core";
import {PropsWithChildren} from "react";
import {sepolia} from "@starknet-react/chains";
import {ControllerConnector} from "@cartridge/connector";
import {Connector} from "@starknet-react/core";
import {RpcProvider} from "starknet";
import {SessionPolicies} from "@cartridge/controller";


const CONTRACT_ACTIONS = '0x61db01335bf2b9518f278971dd05bb9be73cb73d66ca7a26d7957df3374d64'

const policies: SessionPolicies = {
    contracts: {
        [CONTRACT_ACTIONS]: {
            methods: [
                {name: "join_queue", entrypoint: "join_queue"},
                {name: "make_move", entrypoint: "make_move"},
            ],
        },
    }
}

export const connector = new ControllerConnector({
    policies,
    chains: [
        {
            rpcUrl: "https://api.cartridge.gg/x/mammo-checkers/katana",
        },
    ],
    defaultChainId: "0x57505f4d414d4d4f5f434845434b455253",
}) as never as Connector;

function provider() {
    return new RpcProvider({
        nodeUrl: "https://api.cartridge.gg/x/mammo-checkers/katana",
    });
}

export function StarknetProvider({children}: PropsWithChildren) {
    return (
        <StarknetConfig
            autoConnect
            chains={[sepolia]}
            connectors={[connector]}
            explorer={starkscan}
            provider={provider}>
            {children}
        </StarknetConfig>
    );
}
