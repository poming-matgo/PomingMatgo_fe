import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Store & Hooks
import { useGameStore } from '../store/gameStore';
import { useGameWebSocket } from '../hooks/useGameWebSocket';

// Types
import { Player } from '../types/websocket';
import type { LeaderSelectionResultData } from '../types/websocket';
import type { DistributeCardData, DistributedFloorCardData, AnnounceTurnInformationData } from '../types/websocket';

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

  // 잘못된 접근 방지 (state가 없으면 홈으로 리다이렉트)
  useEffect(() => {
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  // 2. Global Game Store
  const {
    player, opponent, field, currentTurn,
    setPlayerHand, setOpponentCardCount, setFloorCards, setRoundInfo, reset,
  } = useGameStore();

  // 3. Local UI State
  const [opponentConnected, setOpponentConnected] = useState(initialHasOpponent);
  const [myReady, setMyReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [isPickingFirst, setIsPickingFirst] = useState(false);

  // 선공 정하기 관련 상태
  const [cardSelections, setCardSelections] = useState<CardSelection[]>([]);
  const [selectionResult, setSelectionResult] = useState<LeaderSelectionResultData | null>(null);

  // 게임 시작 4가지 조건 추적
  const [hasDistributeCard, setHasDistributeCard] = useState(false);
  const [hasFloorCard, setHasFloorCard] = useState(false);
  const [hasTurnInfo, setHasTurnInfo] = useState(false);
  const [leaderTimerDone, setLeaderTimerDone] = useState(false);
  const leaderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 4가지 조건 모두 만족 → 게임 화면으로 전환 (딜링 애니메이션 포함)
  const allConditionsMet = hasDistributeCard && hasFloorCard && hasTurnInfo && leaderTimerDone;

  const myPlayer = userId === '1' ? Player.PLAYER_1 : Player.PLAYER_2;

  // 4. WebSocket Handlers
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
    setSelectionResult(data);
    // 선 플레이어가 정해지고 3초 후 타이머 완료
    leaderTimerRef.current = setTimeout(() => {
      setLeaderTimerDone(true);
    }, 3000);
  }, []);

  // 카드 배분 핸들러 (서버는 자기 카드만 전송, 상대 카드는 비공개)
  const handleDistributeCard = useCallback((msgPlayer: typeof Player[keyof typeof Player], cards: DistributeCardData) => {
    if (msgPlayer === myPlayer) {
      setPlayerHand(cards);
      // 상대도 같은 수의 카드를 받았으므로 뒤집힌 카드로 표시
      setOpponentCardCount(cards.length);
    }
    setHasDistributeCard(true);
  }, [myPlayer, setPlayerHand, setOpponentCardCount]);

  // 바닥 패 배분 핸들러
  const handleDistributedFloorCard = useCallback((data: DistributedFloorCardData) => {
    setFloorCards(data);
    setHasFloorCard(true);
  }, [setFloorCards]);

  // 턴 정보 핸들러
  const handleAnnounceTurnInformation = useCallback((data: AnnounceTurnInformationData) => {
    setRoundInfo(data, myPlayer);
    setHasTurnInfo(true);
  }, [setRoundInfo, myPlayer]);

  // 타이머 클린업
  useEffect(() => {
    return () => {
      if (leaderTimerRef.current) clearTimeout(leaderTimerRef.current);
    };
  }, []);

  // 5. WebSocket Connection
  const { isConnected, connectedPlayers, sendReady, sendLeaderSelection } = useGameWebSocket({
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
  });

  const hasOpponent = opponentConnected || connectedPlayers.length >= 2;

  // state가 없으면 렌더링하지 않음 (리다이렉트 전)
  if (!state) return null;

  // 6. Conditional Rendering Logic
  const renderContent = () => {
    // 1순위: 4가지 조건 만족 → 게임 화면 (첫 진입 시 딜링 애니메이션)
    if (allConditionsMet) {
      return (
        <ActiveGameScreen
          player={player}
          opponent={opponent}
          field={field}
          currentTurn={currentTurn}
          isDealing
        />
      );
    }

    // 2순위: 선공 정하기 단계일 때
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

    // 3순위: 대기실 (기본)
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
      {/* 헤더 영역 */}
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

      {/* 메인 컨텐츠 영역 (상태에 따라 변경됨) */}
      {renderContent()}
    </div>
  );
};
