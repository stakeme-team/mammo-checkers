import React, { useCallback, useState, useEffect } from "react";
import { useAccount } from '@starknet-react/core'
import { gql, useQuery } from '@apollo/client'
import { Unity, useUnityContext } from "react-unity-webgl";
import { MatchCreatedSubscription, MoveMadeSubscription } from './EventsSubscription';

const CHECK_QUEUE_QUERY = gql`
  query MyCheckersMatchQueueModels($player: String!) {
    myCheckersMatchQueueModels(where: { first_player: $player }) {
      edges {
        node {
          game_type
          first_player
          waiting_count
          queue_id
        }
      }
    }
  }
`;

const CHECK_PLAYER2_MATCHES = gql`
  query MyCheckersGameMatchModels($player: String!) {
    myCheckersGameMatchModels(where: { player2: $player }, first: 1) {
      edges {
        node {
          match_id
          player1
          player2
          bet_amount
          game_type
          status
          current_turn
          chain_capture_in_progress
          last_move_timestamp
          move_count
          winner
        }
      }
    }
  }
`;

const CHECK_PLAYER1_MATCHES = gql`
  query MyCheckersGameMatchModels($player: String!) {
    myCheckersGameMatchModels(where: { player1: $player }, first: 1) {
      edges {
        node {
          match_id
          player1
          player2
          bet_amount
          game_type
          status
          current_turn
          chain_capture_in_progress
          last_move_timestamp
          move_count
          winner
        }
      }
    }
  }
`;

export const JoinQueue = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [readyMatch, setReady] = useState<boolean>(false);
  const [showUnity, setShowUnity] = useState<boolean>(false);
  const [matchData, setMatchData] = useState<{
    player: number;
    current_turn: number;
    match_id: number;
  } | null>(null);
  const { account } = useAccount();

  const { data: queueData, loading: queueLoading } = useQuery(CHECK_QUEUE_QUERY, {
    variables: { player: account?.address },
    skip: !account?.address
  });

  const { data: player2Matches, loading: player2Loading } = useQuery(CHECK_PLAYER2_MATCHES, {
    variables: { player: account?.address },
    skip: !account?.address
  });

  const { data: player1Matches, loading: player1Loading } = useQuery(CHECK_PLAYER1_MATCHES, {
    variables: { player: account?.address },
    skip: !account?.address
  });

  const { unityProvider, isLoaded, sendMessage, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "build/checkers.loader.js",
    dataUrl: "build/checkers.data.unityweb",
    frameworkUrl: "build/checkers.framework.js.unityweb",
    codeUrl: "build/checkers.wasm.unityweb",
  });

  const handleMovePiece = useCallback(async (matchId: number, fromX: number, fromY: number, toX: number, toY: number) => {
    if (!account) return;

    setSubmitted(true);
    try {
      const result = await account.execute([
        {
          contractAddress: "0x519941073916af8b117c423f7f76ee5f25297b269c405459afce77419f16bc6",
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
  }, [account]);

  useEffect(() => {
    addEventListener("MovePiece", handleMovePiece);
    return () => {
      removeEventListener("MovePiece", handleMovePiece);
    };
  }, [addEventListener, removeEventListener, handleMovePiece]);

  useEffect(() => {
    if (isLoaded && matchData) {
      const { player, current_turn, match_id } = matchData;
      sendMessage("Board", "InitPlayer", `${player},${current_turn},${match_id}`);
    }
  }, [isLoaded, matchData, sendMessage]);

  const execute = useCallback(async () => {
    if (!account) return;

    // Проверка очереди
    if (queueData?.myCheckersMatchQueueModels?.edges?.length > 0) {
      setReady(true);
      setShowUnity(false);
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
        });
        setShowUnity(true);
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
        });
        setShowUnity(true);
        setReady(true);
        return;
      }
    }

    // Если ни одна проверка не прошла, выполняем стандартную логику
    setSubmitted(true);
    try {
      const result = await account.execute([
        {
          contractAddress: "0x6097d4898eb167c6e6020af162341d22c18b3997e53ecd3e35bc6dd8e5e54f3",
          entrypoint: "join_queue",
          calldata: [1],
        },
      ]);
      setShowUnity(false);
      setReady(true);
      console.log(result);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitted(false);
    }
  }, [account, queueData, player2Matches, player1Matches]);

  const handleMatchCreated = useCallback((matchInfo: any) => {
    if (!account?.address) return;

    // Проверяем, участвует ли текущий игрок в матче
    if (matchInfo.player1 === account.address || matchInfo.player2 === account.address) {
      const playerNumber = matchInfo.player1 === account.address ? 1 : 2;

      setMatchData({
        player: playerNumber,
        current_turn: playerNumber, // Первый ход у player1
        match_id: matchInfo.match_id,
      });
      setShowUnity(true);
      setReady(true);
    }
  }, [account]);

  if (!account) return null;

  if (readyMatch) {
    return (
      <div>
        {showUnity ? (
          <div>
            <Unity unityProvider={unityProvider} style={{ width: '600px', height: '600px' }} />
            <MoveMadeSubscription 
              match_id={matchData?.match_id}
              address={account.address}
              sendMessage={sendMessage}
              current_turn={matchData?.player}
            />
          </div>
        ) : (
          <div>
            <p>Waiting for another player. Please wait...</p>
            <MatchCreatedSubscription onMatchCreated={handleMatchCreated} />
          </div>
        )}
        <button disabled>Play</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => execute()} disabled={submitted}>
        Play
      </button>
    </div>
  );
};