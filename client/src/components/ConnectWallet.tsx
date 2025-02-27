import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui-next";

export function ConnectWallet() {
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const { address } = useAccount();
	const controller = connectors[0] as ControllerConnector;

	return (
		<>
			<div style={{ position: "absolute", right: "20px", top: "20px" }}>
				{address ? (
					<Button
						style={{
							background: "#7240D7",
							display: "flex",
							alignItems: "center",
							gap: "5px",
							borderRadius: "30px	",
							padding: "15px 20px",
							boxShadow:
								"0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)",
						}}
						onClick={() => disconnect()}
					>
						Disconnect{" "}
						{address && (
							<p
								style={{
									margin: "0",
									overflow: "hidden",
									maxWidth: "60px",
									textOverflow: "ellipsis",
								}}
							>
								{address}
							</p>
						)}
					</Button>
				) : (
					<Button
						style={{
							background: "#7240D7",
							display: "flex",
							alignItems: "center",
							gap: "5px",
							borderRadius: "30px	",
							padding: "15px 20px",
							boxShadow:
								"0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)",
						}}
						onClick={() => connect({ connector: controller })}
					>
						Connect
					</Button>
				)}
			</div>
		</>
	);
}
