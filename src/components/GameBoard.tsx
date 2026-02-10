import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Store & Hooks
import { useGameStore } from '../store/gameStore';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { useAnimationQueue } from '../hooks/useAnimationQueue';

// Types
import { Player } from '../types/websocket';
import type { 
  LeaderSelectionResultData, 
  DistributeCardData, 
  DistributedFloorCardData, 
  AnnounceTurnInformationData, 
  AcquiredCardData 
} from '../types/websocket';

// Sub Components (UI)
import { GameHeader } from './gameScreens/GameHeader';
import { WaitingScreen } from './gameScreens/WaitingScreen';
import { LeaderSelectionScreen } from './gameScreens/LeaderSelectionScreen';
import { ActiveGameScreen } from './gameScreens/ActiveGameScreen';

const SetupCondition = {
  HAND: 'HAND',
  FLOOR: 'FLOOR',
  TURN: 'TURN',
} as const;

// 1. 게임 진행 단계 정의 (State Machine)
const GamePhase = {
  WAITING: 'WAITING',
  LEADER_SELECTION: 'LEADER_SELECTION',
  SETUP: 'SETUP',
  PLAYING: 'PLAYING',
} as const;

type GamePhase = typeof GamePhase[keyof typeof GamePhase];

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
  // --- 1. Router & Base State ---
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as GameRouteState | null;

  const userId = state?.userId ?? '';
  const roomId = state?.roomId ?? '';
  const initialHasOpponent = state?.initialHasOpponent ?? false;

  const myPlayer = useMemo(() => (userId === '1' ? Player.PLAYER_1 : Player.PLAYER_2), [userId]);

  // --- 2. Hooks & Store ---
  // 렌더링에 필요한 상태만 구독 (함수는 getState()로 직접 호출)
  const player = useGameStore(state => state.player);
  const opponent = useGameStore(state => state.opponent);
  const field = useGameStore(state => state.field);
  const currentTurn = useGameStore(state => state.currentTurn);
  const reset = useGameStore(state => state.reset); // 헤더에서 사용

  const { enqueue } = useAnimationQueue(800); // 애니메이션 큐 훅 사용

  // --- 3. Game State Management ---
  const [phase, setPhase] = useState<GamePhase>(GamePhase.WAITING);
  const phaseRef = useRef(phase); // WebSocket 핸들러에서 최신 phase 참조용

  // phase가 변경될 때마다 ref 업데이트
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // 대기실 상태 그룹화
  const [connectionState, setConnectionState] = useState({
    isConnected: false, // 소켓 연결 여부 (useGameWebSocket에서 받음)
    hasOpponent: initialHasOpponent,
    myReady: false,
    opponentReady: false,
  });

  // 선 잡기 상태 그룹화
  const [leaderState, setLeaderState] = useState({
    selections: [] as CardSelection[],
    result: null as LeaderSelectionResultData | null,
  });

  // Setup 완료 조건 체크 (Hand, Floor, Turn 정보 수신 여부)
  const [setupConditions, setSetupConditions] = useState<Set<string>>(new Set());
  const setupTimerRef = useRef<number | null>(null);

  // --- 4. Route Protection ---
  useEffect(() => {
    if (!state) navigate('/');
  }, [state, navigate]);

  // --- 5. Phase Transition Logic (LEADER_SELECTION -> SETUP -> PLAYING) ---
  useEffect(() => {
    // 선 잡기 결과를 받은 후 필수 데이터가 모두 도착하면 SETUP 단계로 진입
    if (phase === GamePhase.LEADER_SELECTION && leaderState.result) {
      const requiredConditions = [SetupCondition.HAND, SetupCondition.FLOOR, SetupCondition.TURN];
      const isReady = requiredConditions.every((cond) => setupConditions.has(cond));

      // 타이머가 아직 설정되지 않았고, 모든 데이터가 준비되었으면 타이머 설정
      if (isReady && !setupTimerRef.current) {
        // 모든 데이터 수신 완료 -> 결과 확인을 위해 3초 대기 후 SETUP 단계 진입
        setupTimerRef.current = window.setTimeout(() => {
          setPhase(GamePhase.SETUP);
          setupTimerRef.current = null;
        }, 3000);
      }
    }

    // 클린업: LEADER_SELECTION 단계를 벗어나면 타이머 정리
    return () => {
      if (setupTimerRef.current && phase !== GamePhase.LEADER_SELECTION) {
        clearTimeout(setupTimerRef.current);
        setupTimerRef.current = null;
      }
    };
  }, [phase, setupConditions, leaderState.result]);

  // 딜링 애니메이션 완료 후 PLAYING 단계로 전환
  const handleDealingComplete = useCallback(() => {
    setPhase(GamePhase.PLAYING);
  }, []);


  // --- 6. WebSocket Event Handlers ---

  // [대기실] 상대방 접속
  const handleOpponentConnect = useCallback((connectedPlayer: Player) => {
    if (connectedPlayer !== myPlayer) {
      setConnectionState(prev => ({ ...prev, hasOpponent: true }));
    }
  }, [myPlayer]);

  // [대기실] 준비 완료
  const handlePlayerReady = useCallback((readyPlayer: Player) => {
    setConnectionState(prev => ({
      ...prev,
      myReady: readyPlayer === myPlayer ? true : prev.myReady,
      opponentReady: readyPlayer !== myPlayer ? true : prev.opponentReady,
    }));
  }, [myPlayer]);

  // [전환] 게임 시작 -> 선 잡기 화면으로 이동
  const handleGameStart = useCallback(() => {
    setPhase(GamePhase.LEADER_SELECTION);
  }, []);

  // [선 잡기] 카드 선택
  const handleLeaderSelection = useCallback((selectedPlayer: Player, cardIndex: number) => {
    setLeaderState(prev => ({
      ...prev,
      selections: [...prev.selections, { player: selectedPlayer, cardIndex }]
    }));
  }, []);

  // [선 잡기 -> 전환] 결과 확인 (SETUP 전환은 useEffect에서 처리)
  const handleLeaderSelectionResult = useCallback((data: LeaderSelectionResultData) => {
    setLeaderState(prev => ({ ...prev, result: data }));
  }, []);

  // [세팅] 카드 분배
  const handleDistributeCard = useCallback((msgPlayer: Player, cards: DistributeCardData) => {
    if (msgPlayer === myPlayer) {
      const { setPlayerHand, setOpponentCardCount } = useGameStore.getState();
      setPlayerHand(cards);
      setOpponentCardCount(cards.length);
    }
    setSetupConditions(prev => new Set(prev).add(SetupCondition.HAND));
  }, [myPlayer]);

  // [세팅] 바닥 패 배치
  const handleDistributedFloorCard = useCallback((data: DistributedFloorCardData) => {
    const { setFloorCards } = useGameStore.getState();
    setFloorCards(data);
    setSetupConditions(prev => new Set(prev).add(SetupCondition.FLOOR));
  }, []);

  // [세팅 & 플레이] 턴 정보 알림
  const handleAnnounceTurnInformation = useCallback((data: AnnounceTurnInformationData) => {
    const { setRoundInfo } = useGameStore.getState();
    if (phaseRef.current === GamePhase.SETUP || phaseRef.current === GamePhase.LEADER_SELECTION) {
      // 초기 세팅 단계에서의 턴 정보
      setRoundInfo(data, myPlayer);
      setSetupConditions(prev => new Set(prev).add(SetupCondition.TURN));
    } else {
      // 게임 중 턴 변경 (애니메이션 큐 사용)
      enqueue(() => setRoundInfo(data, myPlayer));
    }
  }, [myPlayer, enqueue]);

  // [플레이] 카드 제출
  const handleSubmitCard = useCallback((msgPlayer: Player, cardName: string) => {
    const { submitMyCard, submitOpponentCard } = useGameStore.getState();
    enqueue(() => {
      if (msgPlayer === myPlayer) {
        submitMyCard(cardName);
      } else {
        submitOpponentCard(cardName);
      }
    });
  }, [myPlayer, enqueue]);

  // [플레이] 덱에서 뒤집기
  const handleCardRevealed = useCallback((cardName: string) => {
    const { revealCard } = useGameStore.getState();
    enqueue(() => {
      revealCard(cardName);
    });
  }, [enqueue]);

  // [플레이] 카드 획득 (쪽/뻑 포함)
  const handleAcquiredCard = useCallback((msgPlayer: Player, data: AcquiredCardData) => {
    const { acquireCards } = useGameStore.getState();
    enqueue(() => {
      const target = msgPlayer === myPlayer ? 'player' : 'opponent';
      acquireCards(target, data);
    });
  }, [myPlayer, enqueue]);


  // --- 7. WebSocket Connection ---
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

  // 소켓 연결 상태 동기화 (UI 표시용)
  const hasOpponent = connectionState.hasOpponent || connectedPlayers.length >= 2;


  // --- 8. Render Logic ---
  if (!state) return null;

  return (
    <div className="w-[1400px] h-[700px] bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-3 flex flex-col gap-2 overflow-hidden">
      {/* 헤더는 모든 단계에서 항상 표시 */}
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

      {/* 단계별 화면 렌더링 */}
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

      {/* SETUP 단계와 PLAYING 단계는 ActiveGameScreen을 공유하되 isDealing 플래그로 구분 */}
      {(phase === GamePhase.SETUP || phase === GamePhase.PLAYING) && (
        <ActiveGameScreen
          player={player}
          opponent={opponent}
          field={field}
          currentTurn={currentTurn}
          isDealing={phase === GamePhase.SETUP} // SETUP 단계면 카드 분배 애니메이션 표시
          onCardSubmit={sendNormalSubmit}
          onDealingComplete={handleDealingComplete} // 딜링 완료 시 PLAYING으로 전환
        />
      )}
    </div>
  );
};