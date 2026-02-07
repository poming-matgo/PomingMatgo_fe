import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Store & Hooks
import { useGameStore } from '../store/gameStore';
import { useGameWebSocket } from '../hooks/useGameWebSocket';

// Types
import { Player } from '../types/websocket';
import type { LeaderSelectionResultData } from '../types/websocket';
import type { DistributeCardData, DistributedFloorCardData, AnnounceTurnInformationData, AcquiredCardData } from '../types/websocket';

// Sub Components (UI)
import { GameHeader } from './gameScreens/GameHeader';
import { WaitingScreen } from './gameScreens/WaitingScreen';
import { LeaderSelectionScreen } from './gameScreens/LeaderSelectionScreen';
import { ActiveGameScreen } from './gameScreens/ActiveGameScreen';

interface GameRouteState {
  userId: string;
  roomId: string;
  initialHasOpponent: boolean;
}

interface CardSelection {
  player: Player;
  cardIndex: number;
}

export const GameBoard = () => {
  // 1. Navigation & Route State
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as GameRouteState | null;

  const userId = state?.userId ?? '';
  const roomId = state?.roomId ?? '';
  const initialHasOpponent = state?.initialHasOpponent ?? false;

  useEffect(() => {
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  // 2. Global Game Store
  const {
    player, opponent, field, currentTurn,
    setPlayerHand, setOpponentCardCount, setFloorCards, setRoundInfo,
    submitMyCard, submitOpponentCard, revealCard, acquireCards, reset,
  } = useGameStore();

  // 3. Local UI State
  const [opponentConnected, setOpponentConnected] = useState(initialHasOpponent);
  const [myReady, setMyReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [isPickingFirst, setIsPickingFirst] = useState(false);

  const [cardSelections, setCardSelections] = useState<CardSelection[]>([]);
  const [selectionResult, setSelectionResult] = useState<LeaderSelectionResultData | null>(null);

  // 게임 시작 4가지 조건 추적
  const [hasDistributeCard, setHasDistributeCard] = useState(false);
  const [hasFloorCard, setHasFloorCard] = useState(false);
  const [hasTurnInfo, setHasTurnInfo] = useState(false);
  const [leaderTimerDone, setLeaderTimerDone] = useState(false);
  const leaderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [initialDealingDone, setInitialDealingDone] = useState(false);

  const allConditionsMet = hasDistributeCard && hasFloorCard && hasTurnInfo && leaderTimerDone;

  // 디버깅: 조건 확인
  useEffect(() => {
    console.log('Game Start Conditions:', {
      hasDistributeCard,
      hasFloorCard,
      hasTurnInfo,
      leaderTimerDone,
      allConditionsMet
    });
  }, [hasDistributeCard, hasFloorCard, hasTurnInfo, leaderTimerDone, allConditionsMet]);

  const myPlayer = userId === '1' ? Player.PLAYER_1 : Player.PLAYER_2;

  // 4. WebSocket Handlers (기존)
  const handleOpponentConnect = useCallback((connectedPlayer: Player) => {
    if (connectedPlayer !== myPlayer) {
      setOpponentConnected(true);
    }
  }, [myPlayer]);

  const handlePlayerReady = useCallback((readyPlayer: Player) => {
    if (readyPlayer === myPlayer) {
      setMyReady(true);
    } else {
      setOpponentReady(true);
    }
  }, [myPlayer]);

  const handleGameStart = useCallback(() => {
    setIsPickingFirst(true);
  }, []);

  const handleLeaderSelection = useCallback((selectedPlayer: Player, cardIndex: number) => {
    setCardSelections(prev => [...prev, { player: selectedPlayer, cardIndex }]);
  }, []);

  const handleLeaderSelectionResult = useCallback((data: LeaderSelectionResultData) => {
    console.log('handleLeaderSelectionResult called:', data);
    setSelectionResult(data);
    leaderTimerRef.current = setTimeout(() => {
      console.log('Leader timer done!');
      setLeaderTimerDone(true);
    }, 3000);
  }, []);

  const handleDistributeCard = useCallback((msgPlayer: typeof Player[keyof typeof Player], cards: DistributeCardData) => {
    console.log('handleDistributeCard called:', { msgPlayer, myPlayer, cards });
    if (msgPlayer === myPlayer) {
      setPlayerHand(cards);
      setOpponentCardCount(cards.length);
    }
    setHasDistributeCard(true);
  }, [myPlayer, setPlayerHand, setOpponentCardCount]);

  const handleDistributedFloorCard = useCallback((data: DistributedFloorCardData) => {
    console.log('handleDistributedFloorCard called:', data);
    setFloorCards(data);
    setHasFloorCard(true);
  }, [setFloorCards]);

  // 애니메이션 큐 관리
  const [animationQueue, setAnimationQueue] = useState<Array<() => void>>([]);
  const isProcessingRef = useRef(false);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 큐 처리
  useEffect(() => {
    if (isProcessingRef.current || animationQueue.length === 0) {
      return;
    }

    console.log('⏳ Animation queue processing, length:', animationQueue.length);
    isProcessingRef.current = true;
    const action = animationQueue[0];

    console.log('▶️ Executing animation action');
    action();

    // 800ms 후 다음 액션 처리
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    animationTimerRef.current = setTimeout(() => {
      console.log('✅ Animation action completed, moving to next');
      isProcessingRef.current = false;
      animationTimerRef.current = null;
      setAnimationQueue(prev => prev.slice(1));
    }, 800);
  }, [animationQueue]);

  const enqueueAnimation = useCallback((action: () => void) => {
    console.log('➕ Adding action to animation queue');
    setAnimationQueue(prev => {
      const newQueue = [...prev, action];
      console.log('📋 Queue length after add:', newQueue.length);
      return newQueue;
    });
  }, []);

  const handleAnnounceTurnInformation = useCallback((data: AnnounceTurnInformationData) => {
    console.log('handleAnnounceTurnInformation called:', data);
    // 턴 정보도 애니메이션 큐에 추가하여 순차 처리
    enqueueAnimation(() => {
      setRoundInfo(data, myPlayer);
    });
    setHasTurnInfo(true);
  }, [setRoundInfo, myPlayer, enqueueAnimation]);

  // 5. 게임 진행 핸들러 (애니메이션 큐 사용)
  const handleSubmitCard = useCallback((msgPlayer: Player, cardName: string) => {
    console.log('🎴 handleSubmitCard called:', { msgPlayer, cardName });
    enqueueAnimation(() => {
      console.log('🎴 Executing submitCard animation');
      if (msgPlayer === myPlayer) {
        submitMyCard(cardName);
      } else {
        submitOpponentCard(cardName);
      }
    });
  }, [myPlayer, submitMyCard, submitOpponentCard, enqueueAnimation]);

  const handleCardRevealed = useCallback((cardName: string) => {
    console.log('🃏 handleCardRevealed called:', cardName);
    enqueueAnimation(() => {
      console.log('🃏 Executing revealCard animation');
      revealCard(cardName);
    });
  }, [revealCard, enqueueAnimation]);

  const handleAcquiredCard = useCallback((msgPlayer: Player, data: AcquiredCardData) => {
    console.log('💎 handleAcquiredCard called:', { msgPlayer, data });
    enqueueAnimation(() => {
      console.log('💎 Executing acquireCards animation');
      const target = msgPlayer === myPlayer ? 'player' : 'opponent';
      acquireCards(target, data);
    });
  }, [myPlayer, acquireCards, enqueueAnimation]);

  // 타이머 클린업
  useEffect(() => {
    return () => {
      if (leaderTimerRef.current) clearTimeout(leaderTimerRef.current);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, []);

  // 6. WebSocket Connection
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

  const hasOpponent = opponentConnected || connectedPlayers.length >= 2;

  if (!state) return null;

  // 7. Conditional Rendering
  const renderContent = () => {
    if (allConditionsMet) {
      return (
        <ActiveGameScreen
          player={player}
          opponent={opponent}
          field={field}
          currentTurn={currentTurn}
          isDealing={!initialDealingDone}
          onCardSubmit={sendNormalSubmit}
          onDealingComplete={() => setInitialDealingDone(true)}
        />
      );
    }

    if (isPickingFirst) {
      return (
        <LeaderSelectionScreen
          myPlayer={myPlayer}
          cardSelections={cardSelections}
          selectionResult={selectionResult}
          onSelectCard={(index) => sendLeaderSelection(index)}
        />
      );
    }

    return (
      <WaitingScreen
        hasOpponent={hasOpponent}
        myReady={myReady}
        opponentReady={opponentReady}
      />
    );
  };

  return (
    <div className="w-[1400px] h-[700px] bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-3 flex flex-col gap-2 overflow-hidden">
      <GameHeader
        userId={userId}
        isConnected={isConnected}
        hasOpponent={hasOpponent}
        isGameStarted={allConditionsMet}
        isPickingFirst={isPickingFirst}
        myReady={myReady}
        onReady={sendReady}
        onExit={() => navigate('/')}
        onReset={reset}
      />
      {renderContent()}
    </div>
  );
};
