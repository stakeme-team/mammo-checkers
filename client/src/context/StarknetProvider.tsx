import { StarknetConfig, starkscan } from "@starknet-react/core";
import { PropsWithChildren } from "react";
import { sepolia } from "@starknet-react/chains";
import { ControllerConnector } from "@cartridge/connector";
import { Connector } from "@starknet-react/core";
import { RpcProvider } from "starknet";
import { SessionPolicies } from "@cartridge/controller";

export const CONTRACT_ACTIONS = import.meta.env.VITE_CONTRACT_ACTIONS_ADDRESS;

const policies: SessionPolicies = {
	contracts: {
		[CONTRACT_ACTIONS]: {
			methods: [
				{ name: "Move in checkers", entrypoint: "make_move" },
				{ name: "Move in corner", entrypoint: "corner_make_moves" },
				//{name: "Offer draw", entrypoint: "offer_draw"},
			],
		},
	},
};

export const connector = new ControllerConnector({
	policies,
	chains: [
		{
			rpcUrl: import.meta.env.VITE_NODE_URL,
		},
	],
	defaultChainId: import.meta.env.VITE_DEFAULT_CHAIN_ID,
}) as never as Connector;

function provider() {
	return new RpcProvider({
		nodeUrl: import.meta.env.VITE_NODE_URL,
	});
}

export function StarknetProvider({ children }: PropsWithChildren) {
	return (
		<StarknetConfig
			autoConnect
			chains={[sepolia]}
			connectors={[connector]}
			explorer={starkscan}
			provider={provider}
		>
			{children}
		</StarknetConfig>
	);
}
