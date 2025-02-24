import React, { useCallback, useState, useEffect } from "react";
import { useAccount } from '@starknet-react/core'
import { gql, useQuery } from '@apollo/client'
import { Unity, useUnityContext } from "react-unity-webgl";
import { MatchCreatedSubscription, MoveMadeSubscription } from './EventsSubscription';
import Modal from 'react-modal';
import { DrawButton } from './DrawButton';
import { DrawSubscription } from './DrawSubscription';
import { WatchMatch } from './WatchMatch';

// Устанавливаем элемент приложения для модального окна
Modal.setAppElement('#root');

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
    game_type: string,
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { account } = useAccount();
  const [opponentOfferedDraw, setOpponentOfferedDraw] = useState(false);

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
          contractAddress: "0x4ac0fb7565427c29a9503e68398a4e576cd9eed790fe516e7404c68c124e85f",
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

  const handleMoveCornerPiece = useCallback(async (matchId: number, steps: number[]) => {
    if (!account) return;

    setSubmitted(true);
    try {
      // Преобразуем steps в массив кортежей
      const formattedSteps = [];
      for (let i = 0; i < steps.length; i += 4) {
        formattedSteps.push([steps[i], steps[i + 1], steps[i + 2], steps[i + 3]]);
      }

      console.log(formattedSteps.length, ...formattedSteps.flat())
      const result = await account.execute([
        {
          contractAddress: "0x4ac0fb7565427c29a9503e68398a4e576cd9eed790fe516e7404c68c124e85f",
          entrypoint: "corner_make_moves",
          calldata: [matchId, formattedSteps.length, ...formattedSteps.flat()],
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
    addEventListener("MoveCornerPiece", handleMoveCornerPiece);
    return () => {
      removeEventListener("MovePiece", handleMovePiece);
      removeEventListener("MoveCornerPiece", handleMoveCornerPiece);
    };
  }, [addEventListener, removeEventListener, handleMovePiece, handleMoveCornerPiece]);

  useEffect(() => {
    if (isLoaded && matchData) {
      const { player, current_turn, match_id, game_type } = matchData;
      sendMessage("Board", "InitPlayer", `${player},${current_turn},${match_id},${game_type}`);

      // Добавляем подписку на DrawSubscription при запуске Unity
      setShowUnity(true);
    }
  }, [isLoaded, matchData, sendMessage]);

  const handleGameTypeSelection = async (gameType: number) => {
    setIsModalOpen(false);
    setSubmitted(true);
    try {
      const result = await account.execute([
        {
          contractAddress: "0x4fc3b7a38f6f83fc30c8dc5ae6f28088fbd47aa6147aaac11df80ac39bd646f",
          entrypoint: "join_queue",
          calldata: [gameType],
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
  };

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
          game_type: matchData.game_type
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
          game_type: matchData.game_type
        });
        setShowUnity(true);
        setReady(true);
        return;
      }
    }

    // Если ни одна проверка не прошла, открываем модалку
    setIsModalOpen(true);
  }, [account, queueData, player2Matches, player1Matches]);

  const handleMatchCreated = useCallback((matchInfo: any) => {
    if (!account?.address) return;

    // Проверяем, участвует ли текущий игрок в матче
    if (String(matchInfo.player1) === String(account.address) || String(matchInfo.player2) === String(account.address)) {
      const playerNumber = String(matchInfo.player1) === String(account.address) ? 1 : 2;

      setMatchData({
        player: playerNumber,
        current_turn: 1,
        match_id: matchInfo.match_id,
        game_type: matchInfo.game_type
      });
      setShowUnity(true);
      setReady(true);
    }
  }, [account]);

  const handleDrawOffer = (matchId: number, playerAddress: string) => {
    if (account?.address !== playerAddress) {
      setOpponentOfferedDraw(true);
    }
  };

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
            />
            <DrawButton
              matchId={matchData?.match_id}
              playerNumber={matchData?.player}
              opponentOfferedDraw={opponentOfferedDraw}
              onOpponentOffer={() => setOpponentOfferedDraw(true)}
            />
            <DrawSubscription onDrawOffer={handleDrawOffer} />
            {/* Подключаем WatchMatch для отслеживания изменений в матче */}
            {matchData?.match_id && <WatchMatch matchId={String(matchData.match_id)} />}
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          content: {
            width: '300px',
            height: '200px',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid #333',
            borderRadius: '8px',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          }
        }}
      >
        <h3>What do you want to play?</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => handleGameTypeSelection(0)}
            style={{ backgroundColor: '#646cff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Corner
          </button>
          <button
            onClick={() => handleGameTypeSelection(1)}
            style={{ backgroundColor: '#646cff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Checkers
          </button>
        </div>
      </Modal>
    </div>
  );
};