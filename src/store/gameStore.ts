import { create } from 'zustand';
import type { GameState } from '../types/game';
import type { Card } from '../types/card';
import { createEmptyPlayer } from '../types/game';
import { ALL_CARDS, CARDS, type CardName } from '../types/card';
import type { DistributedFloorCardData, AnnounceTurnInformationData, AcquiredCardData } from '../types/websocket';

interface GameStore extends GameState {
  isGameStarted: boolean;
  roundInfo: AnnounceTurnInformationData | null;
  loadGameState: (state: GameState) => void;
  setPlayerHand: (cardNames: string[]) => void;
  setOpponentCardCount: (count: number) => void;
  setFloorCards: (floorData: DistributedFloorCardData) => void;
  setRoundInfo: (info: AnnounceTurnInformationData, myPlayerId: string) => void;
  startGame: () => void;
  // 카드 제출: 내 손패에서 카드를 바닥으로 이동
  submitMyCard: (cardName: string) => void;
  // 상대 카드 제출: 상대 손패 끝 카드를 바닥으로 이동
  submitOpponentCard: (cardName: string) => void;
  // 덱에서 카드 공개: 바닥으로 이동
  revealCard: (cardName: string) => void;
  // 카드 획득: 바닥에서 해당 플레이어로 이동
  acquireCards: (target: 'player' | 'opponent', data: AcquiredCardData) => void;
  playCard: (card: Card) => void;
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

// CardName 문자열을 Card 객체로 변환
const cardNameToCard = (name: string): Card | null => {
  const card = CARDS[name as CardName];
  return card || null;
};

export const useGameStore = create<GameStore>((set) => ({
  ...createEmptyState(),
  isGameStarted: false,
  roundInfo: null,

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
        hand: Array.from({ length: count }, () => ALL_CARDS[0]),
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
    const card = cardNameToCard(cardName);
    if (!card) return;
    set((state) => ({
      player: {
        ...state.player,
        hand: state.player.hand.filter((c) => c.name !== cardName),
      },
      field: [...state.field, card],
    }));
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
    // data: { "KKUT": ["SEP_4"], "PI": ["SEP_3"] }
    const acquiredCardNames: string[] = [];
    const acquiredByType: Record<string, Card[]> = {};

    for (const [type, names] of Object.entries(data)) {
      acquiredByType[type] = [];
      for (const name of names) {
        acquiredCardNames.push(name);
        const card = cardNameToCard(name);
        if (card) acquiredByType[type].push(card);
      }
    }

    set((state) => {
      // 바닥에서 획득된 카드 제거
      const newField = state.field.filter(
        (c) => !acquiredCardNames.includes(c.name)
      );

      const targetPlayer = state[target];
      const newCaptured = { ...targetPlayer.captured };

      // 각 타입별로 captured에 추가
      for (const [type, cards] of Object.entries(acquiredByType)) {
        const key = type as keyof typeof newCaptured;
        if (newCaptured[key]) {
          newCaptured[key] = [...newCaptured[key], ...cards];
        }
      }

      return {
        field: newField,
        [target]: {
          ...targetPlayer,
          captured: newCaptured,
        },
      };
    });
  },

  playCard: (card: Card) => {
  },

  reset: () => {
    set({ ...createEmptyState(), isGameStarted: false, roundInfo: null });
  },
}));
