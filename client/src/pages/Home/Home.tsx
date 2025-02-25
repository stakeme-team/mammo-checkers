import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "../../graphql/client";
import { StarknetProvider } from "../../context/StarknetProvider";

import { ConnectWallet } from "../../components/ConnectWallet";
import { JoinQueue } from "../../components/PlayBtn";

function Home() {
	return (
		<div
			style={{
				height: "80vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: "140px",
				justifyContent: "center",
			}}
		>
			<ConnectWallet />
			<JoinQueue />
		</div>
	);
}

export default Home;
