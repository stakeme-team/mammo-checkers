import { useCallback, useState, useEffect } from "react";
import { useAccount } from "@starknet-react/core";
import { gql, useQuery, useSubscription } from "@apollo/client";
import { Unity, useUnityContext } from "react-unity-webgl";
import {
	MatchCreatedSubscription,
	MoveMadeSubscription,
	SUBSCRIBE_EVENT_MESSAGE_UPDATED,
} from "./EventsSubscription";
import Modal from "react-modal";
import { CHECK_PLAYER2_MATCHES } from "../graphql/checkPlayer2Matches";
import { CHECK_QUEUE_QUERY } from "../graphql/checkQueueQuery";
import { CHECK_PLAYER1_MATCHES } from "../graphql/checkPlayer1Matches";
import { useNavigate } from "react-router-dom";

// Устанавливаем элемент приложения для модального окна
Modal.setAppElement("#root");

export const JoinQueue = () => {
	const [submitted, setSubmitted] = useState<boolean>(false);
	const navigate = useNavigate();
	const [readyMatch, setReady] = useState<boolean>(false);
	const [matchData, setMatchData] = useState<{
		player: number;
		current_turn: number;
		match_id: number;
		game_type: string;
	} | null>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const { account } = useAccount();
	const [opponentOfferedDraw, setOpponentOfferedDraw] = useState(false);

	const { data: queueData, loading: queueLoading } = useQuery(
		CHECK_QUEUE_QUERY,
		{
			variables: { player: account?.address },
			skip: !account?.address,
			fetchPolicy: "network-only",
		}
	);

	const { data: player2Matches, loading: player2Loading } = useQuery(
		CHECK_PLAYER2_MATCHES,
		{
			variables: { player: account?.address },
			skip: !account?.address,
			fetchPolicy: "network-only",
		}
	);

	const { data: player1Matches, loading: player1Loading } = useQuery(
		CHECK_PLAYER1_MATCHES,
		{
			variables: { player: account?.address },
			skip: !account?.address,
			fetchPolicy: "network-only",
		}
	);

	const {
		unityProvider,
		isLoaded,
		sendMessage,
		addEventListener,
		removeEventListener,
	} = useUnityContext({
		loaderUrl: "build/checkers.loader.js",
		dataUrl: "build/checkers.data.unityweb",
		frameworkUrl: "build/checkers.framework.js.unityweb",
		codeUrl: "build/checkers.wasm.unityweb",
	});

	const handleMovePiece = useCallback(
		async (
			matchId: number,
			fromX: number,
			fromY: number,
			toX: number,
			toY: number
		) => {
			if (!account) return;

			setSubmitted(true);
			try {
				const result = await account.execute([
					{
						contractAddress:
							"0x4ac0fb7565427c29a9503e68398a4e576cd9eed790fe516e7404c68c124e85f",
						entrypoint: "make_move",
						calldata: [matchId, fromX, fromY, toX, toY],
					},
				]);
				console.log(result);
			} catch (e) {
				console.error(e);
			} finally {
				setSubmitted(false);
			}
		},
		[account]
	);

	const handleMoveCornerPiece = useCallback(
		async (matchId: number, steps: number[]) => {
			if (!account) return;

			setSubmitted(true);
			try {
				// Преобразуем steps в массив кортежей
				const formattedSteps = [];
				for (let i = 0; i < steps.length; i += 4) {
					formattedSteps.push([
						steps[i],
						steps[i + 1],
						steps[i + 2],
						steps[i + 3],
					]);
				}

				console.log(formattedSteps.length, ...formattedSteps.flat());
				const result = await account.execute([
					{
						contractAddress:
							"0x4ac0fb7565427c29a9503e68398a4e576cd9eed790fe516e7404c68c124e85f",
						entrypoint: "corner_make_moves",
						calldata: [
							matchId,
							formattedSteps.length,
							...formattedSteps.flat(),
						],
					},
				]);
				console.log(result);
			} catch (e) {
				console.error(e);
			} finally {
				setSubmitted(false);
			}
		},
		[account]
	);

	useEffect(() => {
		addEventListener("MovePiece", handleMovePiece);
		addEventListener("MoveCornerPiece", handleMoveCornerPiece);
		return () => {
			removeEventListener("MovePiece", handleMovePiece);
			removeEventListener("MoveCornerPiece", handleMoveCornerPiece);
		};
	}, [
		addEventListener,
		removeEventListener,
		handleMovePiece,
		handleMoveCornerPiece,
	]);
	const { data: messageData } = useSubscription(
		SUBSCRIBE_EVENT_MESSAGE_UPDATED
	);

	const handleGameTypeSelection = async (gameType: number) => {
		setSubmitted(true);
		try {
			const result = await account?.execute([
				{
					contractAddress:
						"0x4fc3b7a38f6f83fc30c8dc5ae6f28088fbd47aa6147aaac11df80ac39bd646f",
					entrypoint: "join_queue",
					calldata: [gameType],
				},
			]);
			setReady(true);
			console.log(result);
		} catch (e) {
			console.error(e);
		} finally {
			setSubmitted(false);
		}
	};

	const execute = useCallback(async () => {
		if (!account) return;

		// Проверка очереди
		if (queueData?.myCheckersMatchQueueModels?.edges?.length > 0) {
			setReady(true);
			return;
		}

		// Проверка матчей где игрок player2
		if (player2Matches?.myCheckersGameMatchModels?.edges?.length > 0) {
			const matchData = player2Matches.myCheckersGameMatchModels.edges[0].node;
			if (matchData.status === "InProgress") {
				setMatchData({
					player: 2,
					current_turn: matchData.current_turn,
					match_id: matchData.match_id,
					game_type: matchData.game_type,
				});
				navigate("/game");

				setReady(true);
				return;
			}
		}

		// Проверка матчей где игрок player1
		if (player1Matches?.myCheckersGameMatchModels?.edges?.length > 0) {
			const matchData = player1Matches.myCheckersGameMatchModels.edges[0].node;
			if (matchData.status === "InProgress") {
				setMatchData({
					player: 1,
					current_turn: matchData.current_turn,
					match_id: matchData.match_id,
					game_type: matchData.game_type,
				});
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

			// Проверяем, участвует ли текущий игрок в матче
			console.log(matchInfo);

			if (
				String(matchInfo.player1) === String(account.address) ||
				String(matchInfo.player2) === String(account.address)
			) {
				const playerNumber =
					String(matchInfo.player1) === String(account.address) ? 1 : 2;

				setMatchData({
					player: playerNumber,
					current_turn: 1,
					match_id: matchInfo.match_id,
					game_type: matchInfo.game_type,
				});
				setReady(true);
				navigate("/game");
			}
			setIsModalOpen(true);
		},
		[account]
	);

	if (!account) return null;

	console.log(readyMatch);

	return (
		<div>
			<button
				onClick={() => execute()}
				style={{ background: "none", fontSize: "24px" }}
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
