import { useState, useEffect } from "react";
import { useAccount } from "@starknet-react/core";
import { gql, useQuery } from "@apollo/client";

const CHECK_DRAW_STATUS = gql`
	query MyCheckersGameMatchModels($match_id: Int!) {
		myCheckersGameMatchModels(where: { match_id: $match_id }) {
			edges {
				node {
					draw_offered_by_p1
					draw_offered_by_p2
				}
			}
		}
	}
`;

export const DrawButton = ({
	matchId,
	playerNumber,
	opponentOfferedDraw,
	onOpponentOffer,
}: {
	matchId: number | undefined;
	playerNumber: number | undefined;
	opponentOfferedDraw: boolean;
	onOpponentOffer: () => void;
}) => {
	const { account } = useAccount();
	const [isDisabled, setIsDisabled] = useState(true);
	const [isOfferer, setIsOfferer] = useState(false);

	const { data, loading } = useQuery(CHECK_DRAW_STATUS, {
		variables: { match_id: matchId },
	});

	useEffect(() => {
		if (!loading && data) {
			const { draw_offered_by_p1, draw_offered_by_p2 } =
				data.myCheckersGameMatchModels.edges[0].node;
			const hasOffered =
				playerNumber === 1 ? draw_offered_by_p1 : draw_offered_by_p2;
			const opponentHasOffered =
				playerNumber === 1 ? draw_offered_by_p2 : draw_offered_by_p1;

			setIsDisabled(hasOffered);
			if (opponentHasOffered) {
				onOpponentOffer();
			}
		}
	}, [data, loading, playerNumber, onOpponentOffer]);

	const handleDrawOffer = async () => {
		if (!account || typeof matchId != "number") return;

		try {
			await account.execute([
				{
					contractAddress: import.meta.env.VITE_CONTRACT_ACTIONS_ADDRESS,
					entrypoint: "offer_draw",
					calldata: [matchId],
				},
			]);
			setIsOfferer(true);
			setIsDisabled(true);
		} catch (error) {
			console.error("Error offering draw:", error);
		}
	};

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				flexDirection: "column",
				gap: "10px",
			}}
		>
			<button
				onClick={handleDrawOffer}
				disabled={isDisabled}
				style={{
					marginTop: "10px",
					padding: "8px 16px",
					backgroundColor: isDisabled ? "#666" : "#646cff",
					color: "#fff",
					border: "none",
					borderRadius: "4px",
					cursor: isDisabled ? "not-allowed" : "pointer",
				}}
			>
				{isOfferer ? "Draw Offered" : "Offer Draw"}
			</button>

			{opponentOfferedDraw && (
				<p style={{ color: "#fff", marginTop: "10px" }}>
					Your opponent has offered a draw
				</p>
			)}
		</div>
	);
};
