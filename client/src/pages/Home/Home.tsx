import { ConnectWallet } from "../../components/ConnectWallet";
import { JoinQueue } from "../../components/PlayBtn";

function Home() {
	return (
		<div
			style={{
				height: "70vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "flex-end",
			}}
		>
			<ConnectWallet />
			<JoinQueue />
		</div>
	);
}

export default Home;
