import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Store & Hooks
import { useGameStore } from '../store/gameStore';
import { useGameWebSocket } from '../hooks/useGameWebSocket';

// Types
import { Player } from '../types/websocket';
import type { LeaderSelectionResultData } from '../types/websocket';

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
  const state = location.state as GameRouteState;

  // 잘못된 접근 방지 (state가 없으면 홈으로 리다이렉트)
  useEffect(() => {
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state) return null; // 리다이렉트 전 렌더링 방지
  const { userId, roomId, initialHasOpponent } = state;

  // 2. Global Game Store
  const { 
    player, opponent, field, deck, currentTurn, isGameStarted, reset 
  } = useGameStore();

  // 3. Local UI State
  const [opponentConnected, setOpponentConnected] = useState(initialHasOpponent);
  const [myReady, setMyReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [isPickingFirst, setIsPickingFirst] = useState(false);
  
  // 선공 정하기 관련 상태
  const [cardSelections, setCardSelections] = useState<CardSelection[]>([]);
  const [selectionResult, setSelectionResult] = useState<LeaderSelectionResultData | null>(null);

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
    // 참고: 여기서 잠시 후 isPickingFirst를 false로 끄고 게임을 시작하는 로직이 
    // WebSocket이나 Store 내부에서 처리된다고 가정합니다.
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
  });

  const hasOpponent = opponentConnected || connectedPlayers.length >= 2;

  // 6. Conditional Rendering Logic
  const renderContent = () => {
    // 1순위: 게임이 실제로 시작되었을 때
    if (isGameStarted) {
      return (
        <div className="h-full flex flex-col">
          <ActiveGameScreen 
            player={player}
            opponent={opponent}
            field={field}
            deck={deck}
            currentTurn={currentTurn}
          />
        </div>
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
        isGameStarted={isGameStarted}
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