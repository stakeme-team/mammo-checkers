import { useCallback, useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { Unity, useUnityContext } from "react-unity-webgl";
import { MoveMadeSubscription } from "../../components/EventsSubscription";
import { DrawSubscription } from "../../components/DrawSubscription";
import { WatchMatch } from "../../components/WatchMatch";
import { useQuery } from "@apollo/client";
import { CHECK_PLAYER2_MATCHES } from "../../graphql/checkPlayer2Matches";
import { CHECK_PLAYER1_MATCHES } from "../../graphql/checkPlayer1Matches";
import { CHECK_QUEUE_QUERY } from "../../graphql/checkQueueQuery";
import { DrawButton } from "../../components/DrawButton";

export const Game = () => {
	const [readyMatch, setReady] = useState<boolean>(false);
	const [matchData, setMatchData] = useState<{
		player: number;
		current_turn: number;
		match_id: number;
		game_type: string;
	} | null>(null);
	const { account } = useAccount();
	const [opponentOfferedDraw, setOpponentOfferedDraw] = useState(false);

	const { data: queueData, loading: queueLoading } = useQuery(
		CHECK_QUEUE_QUERY,
		{
			variables: { player: account?.address },
			skip: !account?.address,
		}
	);

	const { data: player2Matches, loading: player2Loading } = useQuery(
		CHECK_PLAYER2_MATCHES,
		{
			variables: { player: account?.address },
			skip: !account?.address,
		}
	);

	const { data: player1Matches, loading: player1Loading } = useQuery(
		CHECK_PLAYER1_MATCHES,
		{
			variables: { player: account?.address },
			skip: !account?.address,
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
			}
		},
		[account]
	);

	const handleMoveCornerPiece = useCallback(
		async (matchId: number, steps: number[]) => {
			if (!account) return;

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
			}
		},
		[account]
	);

	useEffect(() => {
		execute();
	}, [player1Matches, player2Matches]);

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

	useEffect(() => {
		if (isLoaded && matchData) {
			const { player, current_turn, match_id, game_type } = matchData;
			sendMessage(
				"Board",
				"InitPlayer",
				`${player},${current_turn},${match_id},${game_type}`
			);

			// Добавляем подписку на DrawSubscription при запуске Unity
		}
	}, [isLoaded, matchData, sendMessage]);

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
				return;
			}
		}
	}, [account, queueData, player2Matches, player1Matches]);

	const handleDrawOffer = (matchId: number, playerAddress: string) => {
		if (account?.address !== playerAddress) {
			setOpponentOfferedDraw(true);
		}
	};

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
			<>
				<div
					style={{
						width: 800,
						height: 800,
						backgroundImage: 'url("../../../public/images/CHECKER_BORDER.png")',
						backgroundSize: "cover",
						backgroundPosition: "center",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Unity
						unityProvider={unityProvider}
						style={{
							width: "610px",
							height: "610px",
							marginLeft: "25px",
							borderRadius: "8px",
						}}
					/>
					<MoveMadeSubscription
						match_id={matchData?.match_id}
						address={account.address}
						sendMessage={sendMessage}
					/>
				</div>
				{matchData?.match_id && (
					<WatchMatch matchId={String(matchData.match_id)} />
				)}
				<DrawButton
					matchId={matchData?.match_id}
					playerNumber={matchData?.player}
					opponentOfferedDraw={opponentOfferedDraw}
					onOpponentOffer={() => setOpponentOfferedDraw(true)}
				/>
				<DrawSubscription onDrawOffer={handleDrawOffer} />
			</>
		</div>
	);
};
