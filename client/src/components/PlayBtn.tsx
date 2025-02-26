import { useCallback, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "@apollo/client";
import { MatchCreatedSubscription } from "./EventsSubscription";
import Modal from "react-modal";
import { CHECK_PLAYER2_MATCHES } from "../graphql/checkPlayer2Matches";
import { CHECK_QUEUE_QUERY } from "../graphql/checkQueueQuery";
import { CHECK_PLAYER1_MATCHES } from "../graphql/checkPlayer1Matches";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

export const JoinQueue = () => {
	const navigate = useNavigate();
	const [readyMatch, setReady] = useState<boolean>(false);

	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const { account } = useAccount();

	const { data: queueData } = useQuery(CHECK_QUEUE_QUERY, {
		variables: { player: account?.address },
		skip: !account?.address,
		fetchPolicy: "network-only",
	});

	const { data: player2Matches } = useQuery(CHECK_PLAYER2_MATCHES, {
		variables: { player: account?.address },
		skip: !account?.address,
		fetchPolicy: "network-only",
	});

	const { data: player1Matches } = useQuery(CHECK_PLAYER1_MATCHES, {
		variables: { player: account?.address },
		skip: !account?.address,
		fetchPolicy: "network-only",
	});

	const handleGameTypeSelection = async (gameType: number) => {
		try {
			await account?.execute([
				{
					contractAddress:
						"0x2e5815d9bdeccb965cab20e59b990390850ea66718a6dfe8205641631124965",
					entrypoint: "join_queue",
					calldata: [gameType],
				},
			]);
			setReady(true);
		} catch (e) {
			console.error(e);
		}
	};

	const execute = useCallback(async () => {
		if (!account) return;

		if (queueData?.myCheckersMatchQueueModels?.edges?.length > 0) {
			setReady(true);

			return;
		}

		if (player2Matches?.myCheckersGameMatchModels?.edges?.length > 0) {
			const matchData = player2Matches.myCheckersGameMatchModels.edges[0].node;
			if (matchData.status === "InProgress") {
				navigate("/game");
				setReady(true);
				return;
			}
		}

		if (player1Matches?.myCheckersGameMatchModels?.edges?.length > 0) {
			const matchData = player1Matches.myCheckersGameMatchModels.edges[0].node;
			if (matchData.status === "InProgress") {
				setReady(true);
				navigate("/game");
				return;
			}
		}
		setIsModalOpen(true);
	}, [account, queueData, player2Matches, player1Matches]);

	const handleMatchCreated = useCallback(
		(matchInfo: any) => {
			if (!account?.address) return;

			if (
				String(matchInfo.player1) === String(account.address) ||
				String(matchInfo.player2) === String(account.address)
			) {
				setReady(true);
				navigate("/game");
			}
			setIsModalOpen(true);
		},
		[account]
	);

	if (!account) return null;

	return (
		<div>
			<button
				onClick={() => execute()}
				style={{ background: "none", fontSize: "24px", marginTop: "10px" }}
			>
				new game
			</button>
			<MatchCreatedSubscription onMatchCreated={handleMatchCreated} />

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
				{!readyMatch ? (
					<>
						<h3>What do you want to play?</h3>
						<div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
							<button
								onClick={() => handleGameTypeSelection(0)}
								className="first-modal-button"
							>
								Corner
							</button>
							<button
								onClick={() => handleGameTypeSelection(1)}
								style={{ background: "#A36DFF" }}
							>
								Checkers
							</button>
						</div>
					</>
				) : (
					<>
						<h3>Looking for an opponent. Please wait</h3>
						<div className="lds-ellipsis">
							<div></div>
							<div></div>
							<div></div>
							<div></div>
						</div>
					</>
				)}
			</Modal>
		</div>
	);
};
