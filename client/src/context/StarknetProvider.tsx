import {StarknetConfig, starkscan} from "@starknet-react/core";
import {PropsWithChildren} from "react";
import {sepolia} from "@starknet-react/chains";
import {ControllerConnector} from "@cartridge/connector";
import {Connector} from "@starknet-react/core";
import {constants, RpcProvider} from "starknet";
import {SessionPolicies} from "@cartridge/controller";


const WORLD_ADDRESS = '0x525177c8afe8680d7ad1da30ca183e482cfcd6404c1e09d83fd3fa2994fd4b8'

const policies: SessionPolicies = {
    contracts: {
        [WORLD_ADDRESS]: {
            methods: [
                {name: "create_lobby", entrypoint: "create_lobby"},
            ],
        },
    }
}

export const connector = new ControllerConnector({
    policies,
    chains: [
        {
            rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
        },
    ],
    defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
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
