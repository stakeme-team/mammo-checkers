import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useEffect, useState } from "react";
import ControllerConnector from "@cartridge/connector/controller";
import { Button } from "@cartridge/ui-next";

export function ConnectWallet() {
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const { address } = useAccount();
	const controller = connectors[0] as ControllerConnector;
	const [username, setUsername] = useState<string>();

	useEffect(() => {
		if (!address) return;
		controller.username()?.then((n) => setUsername(n));
	}, [address, controller]);

	return (
		// <div>
		// 	{address && (
		// 		<>
		// 			<p>Account: {address}</p>
		// 			{username && <p>Username: {username}</p>}
		// 		</>
		// 	)}
		// 	{address ? (
		// 		<Button onClick={() => disconnect()}>Disconnect</Button>
		// 	) : (
		// <Button onClick={() => connect({ connector: controller })}>
		// 	Connect
		// </Button>
		// 	)}
		// </div>
		<>
			<h1
				style={{
					margin: 0,
					display: "flex",
					flexDirection: "column",
					userSelect: "none",
				}}
			>
				<span style={{ fontSize: "120px", lineHeight: "50px" }}>mammo</span>
				<span style={{ fontSize: "110px" }}>checkers</span>
			</h1>

			{address ? (
				<Button style={{ background: "none" }} onClick={() => disconnect()}>
					Disconnect
				</Button>
			) : (
				<Button
					style={{ background: "none" }}
					onClick={() => connect({ connector: controller })}
				>
					Connect
				</Button>
			)}
		</>
	);
}
