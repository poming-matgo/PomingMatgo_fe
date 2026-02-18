import type { Card } from '../../types/card';
import { groupCardsByMonth } from '../../utils/cardGrouping';

// ── 상수 ──────────────────────────────────────────────
// 실제 렌더링 크기: !w-[46px] !h-[67px]
export const CARD_W = 46;
export const CARD_H = 67;
export const CARD_OVERLAP = 26; // marginLeft: -26 → 카드당 20px 노출

const MAX_CARDS_PER_MONTH = 4;

/** 월 그룹이 최대 4장일 때의 예약 너비 (충돌/렌더 공통) */
export const SLOT_W = CARD_W + (MAX_CARDS_PER_MONTH - 1) * (CARD_W - CARD_OVERLAP);
// = 46 + 3 * 20 = 106

// ── 슬롯 그리드 ──────────────────────────────────────
// 간격: 가로 130px, 세로 90px
// SLOT_W=106 → 가로 여유 24px, CARD_H=67 → 세로 여유 23px
// ±4px 지터 적용해도 겹침 불가능
const SX = 150;
const SY = 90;

/**
 * 사전 검증된 14개 슬롯 위치 (중심 좌표).
 * 덱(중앙)과 서로 간에 겹치지 않음이 간격으로 보장됨.
 *
 *   Row -1:  [-2SX] [-SX] [  0 ] [ SX] [2SX]
 *   Row  0:  [-2SX] [-SX] [DECK] [ SX] [2SX]
 *   Row +1:  [-2SX] [-SX] [  0 ] [ SX] [2SX]
 */
const SLOT_POSITIONS: readonly Position[] = [
  // Row top (y = -SY)
  { x: -2 * SX, y: -SY }, // 0
  { x: -SX, y: -SY },     // 1
  { x: 0, y: -SY },       // 2
  { x: SX, y: -SY },      // 3
  { x: 2 * SX, y: -SY },  // 4
  // Row middle (y = 0) — 중앙은 덱이 차지
  { x: -2 * SX, y: 0 },   // 5
  { x: -SX, y: 0 },       // 6
  { x: SX, y: 0 },        // 7
  { x: 2 * SX, y: 0 },    // 8
  // Row bottom (y = +SY)
  { x: -2 * SX, y: SY },  // 9
  { x: -SX, y: SY },      // 10
  { x: 0, y: SY },        // 11
  { x: SX, y: SY },       // 12
  { x: 2 * SX, y: SY },   // 13
];

/** 월(1~12) → 슬롯 인덱스 매핑. 연속된 월이 멀리 배치되도록 분산 */
const MONTH_TO_SLOT: readonly number[] = [
  0,   // 1월 → 좌상 외곽
  13,  // 2월 → 우하 외곽
  3,   // 3월 → 우상
  10,  // 4월 → 좌하
  7,   // 5월 → 우측
  5,   // 6월 → 좌측 외곽
  1,   // 7월 → 상단 중앙
  12,  // 8월 → 하단 중앙
  4,   // 9월 → 우상 외곽
  9,   // 10월 → 좌하 외곽
  6,   // 11월 → 좌측
  8,   // 12월 → 우측 외곽
];

// ── 타입 ──────────────────────────────────────────────
export type MonthGroup = [month: string, cards: Card[]];
export type Position = { x: number; y: number };
export type CachedGroup = { pos: Position };

// ── 순수 헬퍼 ─────────────────────────────────────────

/** 결정적 랜덤 (시드 기반) */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return ((hash & 0x7fffffff) % 1000) / 1000;
}

/** 그룹의 실제 렌더 너비 */
export function getGroupWidth(cardCount: number): number {
  return CARD_W + Math.max(0, cardCount - 1) * (CARD_W - CARD_OVERLAP);
}

/** 월 번호 → 슬롯 위치 (작은 지터 포함) */
function getSlotPosition(month: number): Position {
  const slotIdx = MONTH_TO_SLOT[(month - 1) % 12];
  const base = SLOT_POSITIONS[slotIdx];
  // ±4px 지터 (간격 여유 24/23px 내에서 안전)
  const jx = (seededRandom(`${month}jx`) - 0.5) * 8;
  const jy = (seededRandom(`${month}jy`) - 0.5) * 8;
  return { x: base.x + jx, y: base.y + jy };
}

// ── 공개 API ──────────────────────────────────────────

/** 카드 배열을 월별 정렬된 그룹으로 변환 */
export function getSortedGroups(cards: Card[]): MonthGroup[] {
  const grouped = groupCardsByMonth(cards);
  return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
}

/**
 * 그룹 위치 계산 (순수 함수)
 *
 * - 월별로 사전 정의된 슬롯에 배치 → 겹침 구조적으로 불가능
 * - 한번 배치된 그룹의 위치는 절대 변하지 않음
 * - position은 슬롯의 중심 좌표 (렌더링 시 왼쪽 상단으로 변환)
 */
export function computeGroupPositions(
  sortedGroups: MonthGroup[],
  prevCache: ReadonlyMap<string, CachedGroup>,
): { positions: Position[]; nextCache: Map<string, CachedGroup> } {
  const nextCache = new Map<string, CachedGroup>();
  const positions: Position[] = [];

  for (const [month] of sortedGroups) {
    const cached = prevCache.get(month);

    if (cached) {
      nextCache.set(month, cached);
      positions.push(cached.pos);
      continue;
    }

    const pos = getSlotPosition(Number(month));
    nextCache.set(month, { pos });
    positions.push(pos);
  }

  return { positions, nextCache };
}
