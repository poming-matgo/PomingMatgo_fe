import { create } from 'zustand';
import type { GameState } from '../types/game';
import type { Card } from '../types/card';
import { createEmptyPlayer } from '../types/game';
import { ALL_CARDS } from '../types/card';

interface GameStore extends GameState {
  initializeGame: () => void;
  loadGameState: (state: GameState) => void; // 서버에서 받은 게임 상태 로드
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

// 더미 초기 상태 생성 (실제로는 서버에서 받아올 데이터)
const createInitialState = (): GameState => {
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

export const useGameStore = create<GameStore>((set) => ({
  ...createInitialState(),

  initializeGame: () => {
    set(createInitialState());
  },

  // 서버에서 받은 게임 상태로 업데이트
  loadGameState: (state: GameState) => {
    set(state);
  },

  playCard: (card: Card) => {
    // TODO: 카드 플레이 로직 구현 (향후 추가)
    // 실제로는 서버에 카드 플레이 요청을 보내고, 응답받은 새 게임 상태를 loadGameState로 업데이트
    console.log('Card played:', card);
  },

  reset: () => {
    set(createInitialState());
  }
}));
