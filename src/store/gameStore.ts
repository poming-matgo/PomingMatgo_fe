import { create } from 'zustand';
import type { GameState } from '../types/game';
import type { Card } from '../types/card';
import { createEmptyPlayer } from '../types/game';
import { ALL_CARDS, CARDS, type CardName } from '../types/card';
import type { DistributedFloorCardData, AnnounceTurnInformationData } from '../types/websocket';

interface GameStore extends GameState {
  isGameStarted: boolean;
  roundInfo: AnnounceTurnInformationData | null;
  initializeGame: () => void;
  loadGameState: (state: GameState) => void;
  setPlayerHand: (cardNames: string[]) => void;
  setOpponentCardCount: (count: number) => void;
  setFloorCards: (floorData: DistributedFloorCardData) => void;
  setRoundInfo: (info: AnnounceTurnInformationData, myPlayerId: string) => void;
  startGame: () => void;
  playCard: (card: Card) => void;
  reset: () => void;
}

// 카드 덱 섞기 (더미 데이터용)
const shuffleDeck = (cards: Card[]): Card[] => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 빈 초기 상태 (게임 시작 전)
const createEmptyState = (): GameState => ({
  player: createEmptyPlayer(),
  opponent: createEmptyPlayer(),
  field: [],
  deck: [],
  currentTurn: 'player'
});

// 게임 시작 시 카드 분배 (실제로는 서버에서 받아올 데이터)
const createGameState = (): GameState => {
  const shuffled = shuffleDeck(ALL_CARDS);

  // 카드 분배: 플레이어 10장, 상대 10장, 바닥 8장, 나머지는 덱
  // 실제로는 서버가 이 배치를 결정함
  const playerHand = shuffled.slice(0, 10);
  const opponentHand = shuffled.slice(10, 20);
  const field = shuffled.slice(20, 28);
  const deck = shuffled.slice(28);

  return {
    player: {
      ...createEmptyPlayer(),
      hand: playerHand
    },
    opponent: {
      ...createEmptyPlayer(),
      hand: opponentHand
    },
    field,
    deck,
    currentTurn: 'player'
  };
};

// CardName 문자열을 Card 객체로 변환
const cardNameToCard = (name: string): Card | null => {
  const card = CARDS[name as CardName];
  return card || null;
};

export const useGameStore = create<GameStore>((set) => ({
  ...createEmptyState(),
  isGameStarted: false,
  roundInfo: null,

  initializeGame: () => {
    set({ ...createGameState(), isGameStarted: true });
  },

  loadGameState: (state: GameState) => {
    set(state);
  },

  // 서버에서 받은 내 카드 배분 데이터로 손패 설정
  setPlayerHand: (cardNames: string[]) => {
    const hand = cardNames
      .map(cardNameToCard)
      .filter((c): c is Card => c !== null);
    set((state) => ({
      player: { ...state.player, hand },
    }));
  },

  // 상대방 카드 수 설정 (보이지 않으므로 빈 카드로 수만 맞춤)
  setOpponentCardCount: (count: number) => {
    set((state) => ({
      opponent: {
        ...state.opponent,
        hand: Array.from({ length: count }, () => ALL_CARDS[0]), // placeholder
      },
    }));
  },

  // 바닥 패 설정 (월별 그룹 데이터 → Card[] 변환)
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

  // 라운드/턴 정보 설정 (myPlayerId: 현재 유저의 Player ID)
  setRoundInfo: (info: AnnounceTurnInformationData, myPlayerId: string) => {
    set({
      roundInfo: info,
      currentTurn: info.curPlayer === myPlayerId ? 'player' : 'opponent',
    });
  },

  // 게임 시작 플래그
  startGame: () => {
    set({ isGameStarted: true });
  },

  playCard: (card: Card) => {
    console.log('Card played:', card);
  },

  reset: () => {
    set({ ...createEmptyState(), isGameStarted: false, roundInfo: null });
  },
}));
