import type { Card } from './card';

export type AnimationType = 'submit' | 'reveal' | 'acquire';

export interface CardAnimation {
  id: string;
  type: AnimationType;
  card: Card;
  from: 'player-hand' | 'opponent-hand' | 'deck' | 'field';
  to: 'field' | 'player-captured' | 'opponent-captured';
  fromIndex?: number; // 손패의 경우 인덱스
}

export interface AnimationState {
  currentAnimation: CardAnimation | null;
  animationQueue: CardAnimation[];
}
