import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home/Home.tsx";
import { Game } from "./pages/Game/Game.tsx";
import { StarknetProvider } from "./context/StarknetProvider.tsx";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./graphql/client.tsx";

function App() {
	const location = useLocation();

	const backgroundImage =
		location.pathname === "/"
			? 'url("/images/MENU_BG.png")'
			: 'url("/images/GAME_BG.png")';

	return (
		<div
			style={{
				backgroundImage,
				backgroundSize: "cover",
				backgroundPosition: "center",
				height: "100vh",
			}}
		>
			<StarknetProvider>
				<ApolloProvider client={apolloClient}>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/game" element={<Game />} />
					</Routes>
				</ApolloProvider>
			</StarknetProvider>
		</div>
	);
}

createRoot(document.getElementById("root")!).render(
	<BrowserRouter>
		<App />
	</BrowserRouter>
);
