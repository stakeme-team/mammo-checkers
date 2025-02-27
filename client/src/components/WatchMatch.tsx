import { useEffect, useRef, useState } from "react";
import { gql, useSubscription } from "@apollo/client";
import { lookupAddresses } from "@cartridge/controller";
import { redirect, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { useAccount } from "@starknet-react/core";

const SUBSCRIBE_ONE_MATCH = gql`
	subscription WatchOneMatch {
		entityUpdated {
			updatedAt
			models {
				__typename
				... on my_checkers_GameMatch {
					match_id
					status
					winner
					draw_offered_by_p1
					draw_offered_by_p2
				}
			}
		}
	}
`;

interface WatchMatchProps {
	matchId: string;
	playerNumber: number | undefined;
}

export function WatchMatch({ matchId, playerNumber }: WatchMatchProps) {
	const navigate = useNavigate();
	const { account } = useAccount();
	const drawOfferedRef = useRef(false);

	const skip = !matchId;
	const [isMatchOverForDraw, setMatchOverForDraw] = useState<boolean>(false);
	const [winnerName, setWinnerName] = useState<string>();
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	const [isDrawRequested, setIsDrawRequested] = useState<boolean>();
	const { data, loading, error } = useSubscription(SUBSCRIBE_ONE_MATCH, {
		skip,
		fetchPolicy: "network-only",
	});

	const handleDrawOffer = async () => {
		if (!account) return;

		try {
			await account.execute([
				{
					contractAddress:
						"0x488fb174a5f0e38d578f19e5fdf2a0a5181ad5fcb07848b45090a3a58766411",
					entrypoint: "offer_draw",
					calldata: [matchId],
				},
			]);
		} catch (error) {
			console.error("Error offering draw:", error);
		}
	};

	const handleMatchResult = async (matchModel: any) => {
		try {
			if (matchModel.status === "Finished") {
				const addressMap = await lookupAddresses([matchModel.winner]);
				const winnerName = addressMap.get(matchModel.winner) || "Player";
				setWinnerName(winnerName);
			}
		} catch (err) {
			console.error("Error handling match result:", err);
		}
	};

	useEffect(() => {
		if (error) {
			console.error("Ошибка подписки WatchOneMatch:", error);
			// return;
		}

		if (!loading && data) {
			const entity = data.entityUpdated;
			if (entity && entity.models?.length > 0) {
				const matchModel = entity.models.find(
					(m: any) => m.__typename === "my_checkers_GameMatch"
				);

				if (matchModel && matchModel.match_id == matchId) {
					if (!matchModel.winner || matchModel.status === "Finished") {
						setIsDrawRequested(false);
						handleMatchResult(matchModel);
						setIsModalOpen(true);
						setMatchOverForDraw(false);
					} else if (matchModel.status === "Draw") {
						setIsDrawRequested(false);
						setIsModalOpen(true);
						setMatchOverForDraw(true);
					} else if (
						!drawOfferedRef.current &&
						((playerNumber === 1 && matchModel.draw_offered_by_p2) ||
							(playerNumber === 2 && matchModel.draw_offered_by_p1))
					) {
						setIsDrawRequested(true);
						setIsModalOpen(true);
						drawOfferedRef.current = true;
					}
				}
			}
		}
	}, [loading, data, error, matchId, navigate]);

	if (skip) return null;
	return (
		<Modal
			isOpen={isModalOpen}
			onRequestClose={() => setIsModalOpen(false)}
			style={{
				content: {
					width: "400px",
					height: "200px",
					margin: "auto",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					color: "#ffffff",
					background:
						"linear-gradient(187deg, rgba(176, 93, 255, 1) 0%, rgba(93, 48, 166, 1) 63%, rgba(29, 23, 119, 1) 100%)",
					border: "1px solid #333",
					borderRadius: "12px",
				},
				overlay: {
					backgroundColor: "rgba(0, 0, 0, 0.75)",
				},
			}}
		>
			{isDrawRequested ? (
				<>
					<h3>Your opponent has offered a draw</h3>
					<div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
						<button
							onClick={() => {
								handleDrawOffer();
								redirect("/");
							}}
							className="first-modal-button"
						>
							Confirm
						</button>
						<button
							onClick={() => {
								setIsModalOpen(false);
								setIsDrawRequested(true);
							}}
							style={{ background: "#411066" }}
						>
							Decline
						</button>
					</div>
				</>
			) : isMatchOverForDraw ? (
				<>
					<h3>The game ended in a draw. Try again!</h3>
					<div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
						<button
							onClick={() => navigate("/")}
							className="first-modal-button"
						>
							Main menu
						</button>
					</div>
				</>
			) : (
				<>
					<h3>Congratulations! Player {winnerName} has won the game.</h3>
					<div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
						<button
							onClick={() => navigate("/")}
							className="first-modal-button"
						>
							Play again
						</button>
					</div>
				</>
			)}
		</Modal>
	);
}
