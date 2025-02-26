import { StarknetConfig, starkscan } from "@starknet-react/core";
import { PropsWithChildren } from "react";
import { sepolia } from "@starknet-react/chains";
import { ControllerConnector } from "@cartridge/connector";
import { Connector } from "@starknet-react/core";
import { RpcProvider } from "starknet";
import { SessionPolicies } from "@cartridge/controller";

const CONTRACT_ACTIONS =
	"0x241ffbd1701f9a934ae44f20709dc9bbb1e931abd21d95ab29f4120f3cf6d0a";

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
