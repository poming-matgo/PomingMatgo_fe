import type { Card } from '../types/card';
import { ALL_CARDS, CARDS, CardType, type CardName } from '../types/card';
import type { AcquiredCardData } from '../types/websocket';

/**
 * 타입 가드: 백엔드에서 받은 키가 유효한 CardType인지 확인
 */
export const isValidCardType = (key: string): key is CardType => {
  return key === CardType.GWANG ||
         key === CardType.KKUT ||
         key === CardType.DDI ||
         key === CardType.PI;
};

/**
 * CardName 문자열을 Card 객체로 변환
 * @param name - 카드 이름 문자열
 * @returns Card 객체 또는 null (존재하지 않는 카드인 경우)
 */
export const cardNameToCard = (name: string): Card | null => {
  const card = CARDS[name as CardName];
  if (!card) {
    console.warn(`[gameStore] Unknown card name: ${name}`);
    return null;
  }
  return card;
};

/**
 * 고유한 더미 카드 객체 생성 (상대방 뒷면 카드용)
 * @returns 새로운 Card 객체 (ALL_CARDS[0]의 복사본)
 */
export const createDummyCard = (): Card => ({
  ...ALL_CARDS[0],
  // 고유성을 위해 새 객체로 생성
});

/**
 * 획득한 카드 데이터를 Card 배열로 변환
 * @param data - 백엔드에서 받은 획득 카드 데이터 (예: { "KKUT": ["SEP_4"], "PI": ["SEP_3"] })
 * @returns 변환된 카드 데이터
 *   - allCardNames: 모든 카드 이름의 배열
 *   - cardsByType: CardType별로 그룹화된 Card 배열의 Map
 */
export const convertAcquiredCards = (data: AcquiredCardData): {
  allCardNames: string[];
  cardsByType: Map<CardType, Card[]>;
} => {
  const allCardNames: string[] = [];
  const cardsByType = new Map<CardType, Card[]>();

  for (const [type, names] of Object.entries(data)) {
    // 백엔드 키 검증
    if (!isValidCardType(type)) {
      console.error(`[gameStore] Invalid card type from backend: ${type}`);
      continue;
    }

    const cards: Card[] = [];
    for (const name of names) {
      allCardNames.push(name);
      const card = cardNameToCard(name);
      if (card) {
        cards.push(card);
      }
    }

    if (cards.length > 0) {
      cardsByType.set(type, cards);
    }
  }

  return { allCardNames, cardsByType };
};
