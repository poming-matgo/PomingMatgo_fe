import type { Card } from './card';
import { CardType } from './card';

export { CardType };

export interface CapturedCards {
  [CardType.GWANG]: Card[];
  [CardType.KKUT]: Card[];
  [CardType.DDI]: Card[];
  [CardType.PI]: Card[];
}

export interface Player {
  hand: Card[];           // 손에 든 패
  captured: CapturedCards; // 획득한 패
  score: number;          // 점수
}

export interface GameState {
  player: Player;         // 플레이어
  opponent: Player;       // 상대방
  field: Card[];          // 바닥에 깔린 패
  deck: Card[];           // 덱 (뒤집힌 패)
  currentTurn: 'player' | 'opponent'; // 현재 턴
}

export const createEmptyCapturedCards = (): CapturedCards => ({
  [CardType.GWANG]: [],
  [CardType.KKUT]: [],
  [CardType.DDI]: [],
  [CardType.PI]: []
});

export const createEmptyPlayer = (): Player => ({
  hand: [],
  captured: createEmptyCapturedCards(),
  score: 0
});
