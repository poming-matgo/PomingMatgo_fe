import { create } from 'zustand';
import type { GameState } from '../types/game';
import type { Card } from '../types/card';
import { createEmptyPlayer } from '../types/game';
import type { DistributedFloorCardData, AnnounceTurnInformationData, AcquiredCardData } from '../types/websocket';
import { cardNameToCard, createDummyCard, convertAcquiredCards } from './gameStore.helpers';

interface GameStore extends GameState {
  isGameStarted: boolean;
  roundInfo: AnnounceTurnInformationData | null;
  floorCardChoices: string[] | null;
  goStopChoiceCount: number | null;
  opponentGoStopWaiting: boolean; // 상대가 고/스톱 선택중
  goResultBanner: string | null; // "1고" 같은 배너 텍스트
  playerGoCount: number;
  opponentGoCount: number;
  turnKey: number; // setRoundInfo 호출 시마다 증가 (같은 플레이어 턴 반복 감지용)
  // OPPONENT_PI_CLAIMED이 ACQUIRED_CARD보다 먼저 도착한 경우를 위한 제거 예약
  pendingPiRemovals: string[];
  loadGameState: (state: GameState) => void;
  setPlayerHand: (cardNames: string[]) => void;
  setOpponentCardCount: (count: number) => void;
  setFloorCards: (floorData: DistributedFloorCardData) => void;
  setRoundInfo: (info: AnnounceTurnInformationData, myPlayerId: string) => void;
  startGame: () => void;
  submitMyCard: (cardName: string) => void;
  submitOpponentCard: (cardName: string) => void;
  revealCard: (cardName: string) => void;
  acquireCards: (target: 'player' | 'opponent', data: AcquiredCardData) => void;
  // 피 뺏기: player/opponent 중 카드가 있는 쪽에서 제거 (추가는 ACQUIRED_CARD가 처리)
  removePi: (cardName: string) => void;
  updateScores: (myScore: number, opponentScore: number) => void;
  setFloorCardChoices: (choices: string[] | null) => void;
  setGoStopChoiceCount: (count: number | null) => void;
  setOpponentGoStopWaiting: (waiting: boolean) => void;
  setGoResult: (target: 'player' | 'opponent', goCount: number) => void;
  clearGoResultBanner: () => void;
  reset: () => void;
}

// 빈 초기 상태 (게임 시작 전)
const createEmptyState = (): GameState => ({
  player: createEmptyPlayer(),
  opponent: createEmptyPlayer(),
  field: [],
  deck: [],
  currentTurn: 'player'
});

const INITIAL_STORE_STATE = {
  isGameStarted: false,
  roundInfo: null as AnnounceTurnInformationData | null,
  floorCardChoices: null as string[] | null,
  goStopChoiceCount: null as number | null,
  opponentGoStopWaiting: false,
  goResultBanner: null as string | null,
  playerGoCount: 0,
  opponentGoCount: 0,
  turnKey: 0,
  pendingPiRemovals: [] as string[],
};

/**
 * 특정 플레이어의 PI captured에서 카드를 제거한 새 captured 객체를 반환
 */
const removePiFromCaptured = (
  player: GameState['player'],
  cardName: string,
) => ({
  ...player,
  captured: {
    ...player.captured,
    PI: player.captured.PI.filter(c => c.name !== cardName),
  },
});

/**
 * acquireCards에서 pending 제거 예약을 처리
 * ACQUIRED_CARD보다 OPPONENT_PI_CLAIMED이 먼저 도착한 경우, PI에서 해당 카드를 제거
 */
const applyPendingPiRemovals = (
  piCards: Card[],
  pendingRemovals: string[],
): { filteredPi: Card[]; remainingPending: string[] } => {
  const pendingNames = new Set(pendingRemovals);
  const removedNames = new Set<string>(
    piCards.filter(c => pendingNames.has(c.name)).map(c => c.name),
  );
  return {
    filteredPi: piCards.filter(c => !pendingNames.has(c.name)),
    remainingPending: pendingRemovals.filter(name => !removedNames.has(name)),
  };
};

export const useGameStore = create<GameStore>((set) => ({
  ...createEmptyState(),
  ...INITIAL_STORE_STATE,

  loadGameState: (state: GameState) => {
    set(state);
  },

  setPlayerHand: (cardNames: string[]) => {
    const hand = cardNames
      .map(cardNameToCard)
      .filter((c): c is Card => c !== null);
    set((state) => ({
      player: { ...state.player, hand },
    }));
  },

  setOpponentCardCount: (count: number) => {
    set((state) => ({
      opponent: {
        ...state.opponent,
        hand: Array.from({ length: count }, createDummyCard),
      },
    }));
  },

  setFloorCards: (floorData: DistributedFloorCardData) => {
    const field = Object.values(floorData)
      .flatMap(names => names.map(cardNameToCard))
      .filter((c): c is Card => c !== null);
    set({ field });
  },

  setRoundInfo: (info: AnnounceTurnInformationData, myPlayerId: string) => {
    const newTurn = info.curPlayer === myPlayerId ? 'player' : 'opponent';
    set((state) => ({
      roundInfo: info,
      currentTurn: newTurn,
      turnKey: state.turnKey + 1,
    }));
  },

  startGame: () => {
    set({ isGameStarted: true });
  },

  // 내가 카드를 제출: 손패에서 제거 → 바닥에 추가
  submitMyCard: (cardName: string) => {
    const { player, field } = useGameStore.getState();
    const cardInHand = player.hand.find((c) => c.name === cardName);
    if (!cardInHand) {
      console.warn(`[submitMyCard] Card not found in hand: ${cardName}`,
        'current hand:', player.hand.map(c => c.name));
      return;
    }
    set({
      player: {
        ...player,
        hand: player.hand.filter((c) => c.name !== cardName),
      },
      field: [...field, cardInHand],
    });
  },

  // 상대가 카드를 제출: 손패 끝 카드 제거 → 바닥에 추가
  submitOpponentCard: (cardName: string) => {
    const card = cardNameToCard(cardName);
    if (!card) return;
    set((state) => ({
      opponent: {
        ...state.opponent,
        hand: state.opponent.hand.slice(0, -1),
      },
      field: [...state.field, card],
    }));
  },

  // 덱에서 카드 공개 → 바닥에 추가
  revealCard: (cardName: string) => {
    const card = cardNameToCard(cardName);
    if (!card) return;
    set((state) => ({
      field: [...state.field, card],
    }));
  },

  // 카드 획득: 바닥에서 제거 → 해당 플레이어 captured에 추가
  acquireCards: (target: 'player' | 'opponent', data: AcquiredCardData) => {
    const { allCardNames, cardsByType } = convertAcquiredCards(data);

    if (allCardNames.length === 0) {
      console.warn('[gameStore] No valid cards to acquire');
      return;
    }

    const acquiredNameSet = new Set(allCardNames);

    set((state) => {
      const newField = state.field.filter((c) => !acquiredNameSet.has(c.name));

      const targetPlayer = state[target];
      const newCaptured = { ...targetPlayer.captured };

      for (const [type, cards] of cardsByType.entries()) {
        newCaptured[type] = [...newCaptured[type], ...cards];
      }

      // pending 제거 예약 처리
      let remainingPending = state.pendingPiRemovals;
      if (remainingPending.length > 0) {
        const result = applyPendingPiRemovals(newCaptured.PI, remainingPending);
        newCaptured.PI = result.filteredPi;
        remainingPending = result.remainingPending;
      }

      const updatedPlayer = { ...targetPlayer, captured: newCaptured };
      return {
        field: newField,
        pendingPiRemovals: remainingPending,
        ...(target === 'player' ? { player: updatedPlayer } : { opponent: updatedPlayer }),
      };
    });
  },

  // 피 뺏기: player/opponent 양쪽에서 카드를 찾아 제거
  // 서버가 양쪽에 player=자기자신을 보내므로 target을 특정할 수 없어 양쪽 모두 확인
  removePi: (cardName: string) => {
    set((state) => {
      // opponent에서 찾기 (내가 뺏는 쪽인 경우)
      if (state.opponent.captured.PI.some(c => c.name === cardName)) {
        return { opponent: removePiFromCaptured(state.opponent, cardName) };
      }

      // player에서 찾기 (내가 뺏기는 쪽인 경우)
      if (state.player.captured.PI.some(c => c.name === cardName)) {
        return { player: removePiFromCaptured(state.player, cardName) };
      }

      // 양쪽 다 없으면 제거 예약 (ACQUIRED_CARD보다 먼저 도착한 경우)
      return {
        pendingPiRemovals: [...state.pendingPiRemovals, cardName],
      };
    });
  },

  updateScores: (myScore: number, opponentScore: number) => {
    set((state) => ({
      player: { ...state.player, score: myScore },
      opponent: { ...state.opponent, score: opponentScore },
    }));
  },

  setFloorCardChoices: (choices: string[] | null) => {
    set({ floorCardChoices: choices });
  },

  setGoStopChoiceCount: (count: number | null) => {
    set({ goStopChoiceCount: count });
  },

  setOpponentGoStopWaiting: (waiting: boolean) => {
    set({ opponentGoStopWaiting: waiting });
  },

  setGoResult: (target: 'player' | 'opponent', goCount: number) => {
    const goCountKey = target === 'player' ? 'playerGoCount' : 'opponentGoCount';
    set({
      goResultBanner: `${goCount}고`,
      [goCountKey]: goCount,
    });
  },

  clearGoResultBanner: () => {
    set({ goResultBanner: null });
  },

  reset: () => {
    set({ ...createEmptyState(), ...INITIAL_STORE_STATE });
  },
}));
