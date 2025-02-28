import { Fragment, useCallback, useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { Unity, useUnityContext } from "react-unity-webgl";
import { MoveMadeSubscription } from "../../components/EventsSubscription";
import { WatchMatch } from "../../components/WatchMatch";
import { useQuery } from "@apollo/client";
import { CHECK_PLAYER2_MATCHES } from "../../graphql/checkPlayer2Matches";
import { CHECK_PLAYER1_MATCHES } from "../../graphql/checkPlayer1Matches";
import { CHECK_QUEUE_QUERY } from "../../graphql/checkQueueQuery";
import { DrawButton } from "../../components/DrawButton";
import { ReactUnityEventParameter } from "react-unity-webgl/distribution/types/react-unity-event-parameters";

export const Game = () => {
	const [matchData, setMatchData] = useState<{
		player: number;
		current_turn: number;
		match_id: number;
		game_type: string;
	} | null>(null);
	const [waitingTransaction, setWaitingTransaction] = useState<boolean>(false);
	const { account } = useAccount();
	const [opponentOfferedDraw, setOpponentOfferedDraw] = useState(false);

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

	const {
		unityProvider,
		loadingProgression,
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
			try {
				setWaitingTransaction(true);
				const res: any = await account.execute([
					{
						contractAddress: import.meta.env.VITE_CONTRACT_ACTIONS_ADDRESS,
						entrypoint: "make_move",
						calldata: [matchId, fromX, fromY, toX, toY],
					},
				]);

				if (res.code === "SUCCESS") {
					setWaitingTransaction(false);
				}
			} catch (e) {
				console.error(e);
				setWaitingTransaction(false);
			}
		},
		[account]
	);

	const handleMoveCornerPiece = useCallback(
		async (matchId: number, steps: number[]) => {
			if (!account) return;

			try {
				const formattedSteps = [];
				for (let i = 0; i < steps.length; i += 4) {
					formattedSteps.push([
						steps[i],
						steps[i + 1],
						steps[i + 2],
						steps[i + 3],
					]);
				}

				await account.execute([
					{
						contractAddress: import.meta.env.VITE_CONTRACT_ACTIONS_ADDRESS,
						entrypoint: "corner_make_moves",
						calldata: [
							matchId,
							formattedSteps.length,
							...formattedSteps.flat(),
						],
					},
				]);
			} catch (e) {
				console.error(e);
			}
		},
		[account]
	);
	useEffect(() => {
		addEventListener(
			"MovePiece",
			handleMovePiece as unknown as (
				...args: ReactUnityEventParameter[]
			) => ReactUnityEventParameter
		);
		addEventListener(
			"MoveCornerPiece",
			handleMoveCornerPiece as unknown as (
				...args: ReactUnityEventParameter[]
			) => ReactUnityEventParameter
		);

		return () => {
			removeEventListener(
				"MovePiece",
				handleMovePiece as unknown as (
					...args: ReactUnityEventParameter[]
				) => ReactUnityEventParameter
			);
			removeEventListener(
				"MoveCornerPiece",
				handleMoveCornerPiece as unknown as (
					...args: ReactUnityEventParameter[]
				) => ReactUnityEventParameter
			);
		};
	}, [
		addEventListener,
		removeEventListener,
		handleMovePiece,
		handleMoveCornerPiece,
	]);

	useEffect(() => {
		if (isLoaded && matchData) {
			const { player, current_turn, match_id, game_type } = matchData;
			sendMessage(
				"Board",
				"InitPlayer",
				`${player},${current_turn},${match_id},${game_type}`
			);
		}
	}, [isLoaded, matchData, sendMessage]);

	useEffect(() => {
		execute();
	}, [player1Matches, player2Matches]);

	const execute = useCallback(async () => {
		if (!account) return;

		if (queueData?.myCheckersMatchQueueModels?.edges?.length > 0) {
			return;
		}

		if (player2Matches?.myCheckersGameMatchModels?.edges?.length > 0) {
			const matchData = player2Matches.myCheckersGameMatchModels.edges[0].node;
			if (matchData.status === "InProgress") {
				setMatchData({
					player: 2,
					current_turn: matchData.current_turn,
					match_id: matchData.match_id,
					game_type: matchData.game_type,
				});
				return;
			}
		}
		if (player1Matches?.myCheckersGameMatchModels?.edges?.length > 0) {
			const matchData = player1Matches.myCheckersGameMatchModels.edges[0].node;
			if (matchData.status === "InProgress") {
				setMatchData({
					player: 1,
					current_turn: matchData.current_turn,
					match_id: matchData.match_id,
					game_type: matchData.game_type,
				});
				return;
			}
		}
	}, [account, queueData, player2Matches, player1Matches]);

	if (!account) return null;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100vh",
				alignItems: "center",
			}}
		>
			<div
				style={{
					width: 800,
					height: 800,
					backgroundImage: 'url("/images/CHECKER_BORDER.png")',
					backgroundSize: "cover",
					backgroundPosition: "center",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					position: "relative",
				}}
			>
				<Fragment>
					{!isLoaded && (
						<p
							style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
							}}
						>
							Loading Application... {Math.round(loadingProgression * 100)}%
						</p>
					)}
					<Unity
						unityProvider={unityProvider}
						style={{
							width: "610px",
							height: "610px",
							marginLeft: "25px",
							borderRadius: "8px",
							opacity: waitingTransaction ? "50%" : "100%",
							pointerEvents: waitingTransaction ? "none" : "auto",
							visibility: isLoaded ? "visible" : "hidden",
						}}
					/>
					<MoveMadeSubscription
						match_id={matchData?.match_id}
						address={account.address}
						sendMessage={sendMessage}
					/>
					{waitingTransaction && (
						<p
							style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								fontSize: "20px",
							}}
						>
							Transaction is processing
						</p>
					)}
				</Fragment>
			</div>
			<WatchMatch
				matchId={String(matchData?.match_id)}
				playerNumber={matchData?.player}
			/>

			<DrawButton
				matchId={matchData?.match_id}
				playerNumber={matchData?.player}
				opponentOfferedDraw={opponentOfferedDraw}
				onOpponentOffer={() => setOpponentOfferedDraw(true)}
			/>
		</div>
	);
};
