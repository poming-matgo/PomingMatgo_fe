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

export const useGameStore = create<GameStore>((set) => ({
  ...createEmptyState(),
  isGameStarted: false,
  roundInfo: null,
  floorCardChoices: null,
  pendingPiRemovals: [],

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
    const fieldCards: Card[] = [];
    for (const cardNames of Object.values(floorData)) {
      for (const name of cardNames) {
        const card = cardNameToCard(name);
        if (card) fieldCards.push(card);
      }
    }
    set({ field: fieldCards });
  },

  setRoundInfo: (info: AnnounceTurnInformationData, myPlayerId: string) => {
    set({
      roundInfo: info,
      currentTurn: info.curPlayer === myPlayerId ? 'player' : 'opponent',
    });
  },

  startGame: () => {
    set({ isGameStarted: true });
  },

  // 내가 카드를 제출: 손패에서 제거 → 바닥에 추가
  submitMyCard: (cardName: string) => {
    set((state) => {
      const cardInHand = state.player.hand.find((c) => c.name === cardName);
      if (!cardInHand) {
        console.warn(`[submitMyCard] Card not found in hand: ${cardName}`,
          'current hand:', state.player.hand.map(c => c.name));
        return {
          player: {
            ...state.player,
            hand: [...state.player.hand],
          },
        };
      }
      return {
        player: {
          ...state.player,
          hand: state.player.hand.filter((c) => c.name !== cardName),
        },
        field: [...state.field, cardInHand],
      };
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
    if (!card) {
      return;
    }
    set((state) => {
      return {
        field: [...state.field, card],
      };
    });
  },

  // 카드 획득: 바닥에서 제거 → 해당 플레이어 captured에 추가
  acquireCards: (target: 'player' | 'opponent', data: AcquiredCardData) => {
    const { allCardNames, cardsByType } = convertAcquiredCards(data);

    if (allCardNames.length === 0) {
      console.warn('[gameStore] No valid cards to acquire');
      return;
    }

    set((state) => {
      // 바닥에서 획득된 카드 제거
      const newField = state.field.filter(
        (c) => !allCardNames.includes(c.name)
      );

      const targetPlayer = state[target];
      const newCaptured = { ...targetPlayer.captured };

      // 각 타입별로 captured에 추가
      for (const [type, cards] of cardsByType.entries()) {
        newCaptured[type] = [...newCaptured[type], ...cards];
      }

      // pending 제거 예약이 있으면 방금 추가한 PI에서 즉시 제거
      const pendingNames = new Set(state.pendingPiRemovals);
      let remainingPending = state.pendingPiRemovals;
      if (pendingNames.size > 0) {
        const before = newCaptured.PI.length;
        newCaptured.PI = newCaptured.PI.filter(c => !pendingNames.has(c.name));
        if (newCaptured.PI.length < before) {
          // 소비된 pending 제거
          const consumed = new Set(
            state.pendingPiRemovals.filter(name => !newCaptured.PI.some(c => c.name === name))
          );
          remainingPending = state.pendingPiRemovals.filter(name => !consumed.has(name));
        }
      }

      return {
        field: newField,
        [target]: {
          ...targetPlayer,
          captured: newCaptured,
        },
        pendingPiRemovals: remainingPending,
      } as Partial<GameStore>;
    });
  },

  // 피 뺏기: player/opponent 양쪽에서 카드를 찾아 제거
  // 서버가 양쪽에 player=자기자신을 보내므로 target을 특정할 수 없어 양쪽 모두 확인
  removePi: (cardName: string) => {
    set((state) => {
      // opponent에서 찾기 (내가 뺏는 쪽인 경우)
      if (state.opponent.captured.PI.some(c => c.name === cardName)) {
        return {
          opponent: {
            ...state.opponent,
            captured: {
              ...state.opponent.captured,
              PI: state.opponent.captured.PI.filter(c => c.name !== cardName),
            },
          },
        };
      }

      // player에서 찾기 (내가 뺏기는 쪽인 경우)
      if (state.player.captured.PI.some(c => c.name === cardName)) {
        return {
          player: {
            ...state.player,
            captured: {
              ...state.player.captured,
              PI: state.player.captured.PI.filter(c => c.name !== cardName),
            },
          },
        };
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

  reset: () => {
    set({ ...createEmptyState(), isGameStarted: false, roundInfo: null, floorCardChoices: null, pendingPiRemovals: [] });
  },
}));
