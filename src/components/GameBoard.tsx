import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Store & Hooks
import { useGameStore } from '../store/gameStore';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { useAnimationQueue } from '../hooks/useAnimationQueue';
import { useGamePhase } from '../hooks/useGamePhase';
import { useConnectionState } from '../hooks/useConnectionState';
import { useLeaderState } from '../hooks/useLeaderState';
import { useWebSocketHandlers } from '../hooks/useWebSocketHandlers';

// Types
import { Player } from '../types/websocket';
import type { GameRouteState } from '../types/game';

// Constants
import { GamePhase } from '../constants/gamePhase';

// Sub Components (UI)
import { GameHeader } from './gameScreens/GameHeader';
import { WaitingScreen } from './gameScreens/WaitingScreen';
import { LeaderSelectionScreen } from './gameScreens/LeaderSelectionScreen';
import { ActiveGameScreen } from './gameScreens/ActiveGameScreen';

export const GameBoard = () => {
  // --- 1. Router & Base State ---
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as GameRouteState | null;

  const userId = state?.userId ?? '';
  const roomId = state?.roomId ?? '';
  const initialHasOpponent = state?.initialHasOpponent ?? false;

  const myPlayer = useMemo(() => (userId === '1' ? Player.PLAYER_1 : Player.PLAYER_2), [userId]);

  // --- 2. Hooks & Store ---
  const player = useGameStore(state => state.player);
  const opponent = useGameStore(state => state.opponent);
  const field = useGameStore(state => state.field);
  const currentTurn = useGameStore(state => state.currentTurn);
  const reset = useGameStore(state => state.reset);

  const { enqueue } = useAnimationQueue(800);

  // --- 3. Custom Hooks for State Management ---
  const { leaderState, handleLeaderSelection, handleLeaderSelectionResult } = useLeaderState();

  const {
    phase,
    phaseRef,
    setPhase,
    addSetupCondition,
    handleDealingComplete
  } = useGamePhase({
    leaderResult: leaderState.result
  });

  const {
    connectionState,
    handleOpponentConnect,
    handlePlayerReady
  } = useConnectionState({
    initialHasOpponent,
    myPlayer
  });

  const {
    handleDistributeCard,
    handleDistributedFloorCard,
    handleAnnounceTurnInformation,
    handleSubmitCard,
    handleCardRevealed,
    handleAcquiredCard,
  } = useWebSocketHandlers({
    myPlayer,
    phaseRef,
    addSetupCondition,
    enqueue,
  });

  // --- 4. Route Protection ---
  useEffect(() => {
    if (!state) navigate('/');
  }, [state, navigate]);

  // --- 5. WebSocket Event Handlers ---
  const handleGameStart = useCallback(() => {
    setPhase(GamePhase.LEADER_SELECTION);
  }, [setPhase]);

  // --- 6. WebSocket Connection ---
  const { isConnected, connectedPlayers, sendReady, sendLeaderSelection, sendNormalSubmit } = useGameWebSocket({
    userId,
    roomId,
    onOpponentConnect: handleOpponentConnect,
    onPlayerReady: handlePlayerReady,
    onGameStart: handleGameStart,
    onLeaderSelection: handleLeaderSelection,
    onLeaderSelectionResult: handleLeaderSelectionResult,
    onDistributeCard: handleDistributeCard,
    onDistributedFloorCard: handleDistributedFloorCard,
    onAnnounceTurnInformation: handleAnnounceTurnInformation,
    onSubmitCard: handleSubmitCard,
    onCardRevealed: handleCardRevealed,
    onAcquiredCard: handleAcquiredCard,
  });

  const hasOpponent = connectionState.hasOpponent || connectedPlayers.length >= 2;

  // --- 7. Render Logic ---
  if (!state) return null;

  return (
    <div className="w-[1280px] h-[720px] mx-auto bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-3 flex flex-col gap-1 overflow-hidden rounded-xl shadow-2xl shrink-0">
      <GameHeader
        userId={userId}
        isConnected={isConnected}
        hasOpponent={hasOpponent}
        isGameStarted={phase !== GamePhase.WAITING}
        isPickingFirst={phase === GamePhase.LEADER_SELECTION}
        myReady={connectionState.myReady}
        onReady={sendReady}
        onExit={() => navigate('/')}
        onReset={reset}
      />

      {phase === GamePhase.WAITING && (
        <WaitingScreen
          hasOpponent={hasOpponent}
          myReady={connectionState.myReady}
          opponentReady={connectionState.opponentReady}
        />
      )}

      {phase === GamePhase.LEADER_SELECTION && (
        <LeaderSelectionScreen
          myPlayer={myPlayer}
          cardSelections={leaderState.selections}
          selectionResult={leaderState.result}
          onSelectCard={(index) => sendLeaderSelection(index)}
        />
      )}

      {(phase === GamePhase.SETUP || phase === GamePhase.PLAYING) && (
        <ActiveGameScreen
          player={player}
          opponent={opponent}
          field={field}
          currentTurn={currentTurn}
          isDealing={phase === GamePhase.SETUP}
          onCardSubmit={sendNormalSubmit}
          onDealingComplete={handleDealingComplete}
        />
      )}
    </div>
  );
};
