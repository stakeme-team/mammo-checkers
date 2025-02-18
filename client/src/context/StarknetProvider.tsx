import React from "react";
import {StarknetConfig, starkscan} from "@starknet-react/core";
import {PropsWithChildren} from "react";
import {sepolia} from "@starknet-react/chains";
import {ControllerConnector} from "@cartridge/connector";
import {Connector} from "@starknet-react/core";
import {RpcProvider} from "starknet";
import {SessionPolicies} from "@cartridge/controller";


const CONTRACT_ACTIONS = '0x062f6a8b1bc8f4b45985eaff3b00f85f370d6eb8dcb038072f3bf34fba0dd855'

const policies: SessionPolicies = {
    contracts: {
        [CONTRACT_ACTIONS]: {
            methods: [
                {name: "spawn", entrypoint: "spawn"},
            ],
        },
    }
}

export const connector = new ControllerConnector({
    policies,
    chains: [
        {
            rpcUrl: "https://api.cartridge.gg/x/testBrentimus/katana",
        },
    ],
    defaultChainId: "0x57505f544553544252454e54494d5553",
}) as never as Connector;

function provider() {
    return new RpcProvider({
        nodeUrl: "https://api.cartridge.gg/x/testBrentimus/katana",
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
