import type { Card } from '../types/card';

/**
 * 카드 배열을 월별로 그룹화합니다.
 * @param cards - 그룹화할 카드 배열
 * @returns 월을 키로, 해당 월의 카드 배열을 값으로 하는 객체
 */
export const groupCardsByMonth = (cards: Card[]): Record<number, Card[]> => {
  return cards.reduce((acc, card) => {
    if (!acc[card.month]) {
      acc[card.month] = [];
    }
    acc[card.month].push(card);
    return acc;
  }, {} as Record<number, Card[]>);
};
