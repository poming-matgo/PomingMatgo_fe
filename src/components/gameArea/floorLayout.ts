import type { Card } from '../../types/card';
import { groupCardsByMonth } from '../../utils/cardGrouping';

// ── 상수 ──────────────────────────────────────────────
export const CARD_W = 56;
export const CARD_H = 84;
export const CARD_OVERLAP = 28;

const PADDING = 12;
const DECK_W = 120;
const DECK_H = 140;
const BOUND_X = 420;
const BOUND_Y = 110;

// ── 타입 ──────────────────────────────────────────────
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ExistingGroup {
  x: number;
  y: number;
  w: number;
}

export type MonthGroup = [month: string, cards: Card[]];
export type Position = { x: number; y: number };

// ── 순수 헬퍼 ─────────────────────────────────────────

/** 결정적 랜덤 (시드 기반) */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return ((hash & 0x7fffffff) % 1000) / 1000;
}

/** 그룹의 픽셀 너비 */
export function getGroupWidth(cardCount: number): number {
  return CARD_W + Math.max(0, cardCount - 1) * CARD_OVERLAP;
}

/** 두 rect 충돌 검사 (padding 포함) */
function rectsOverlap(a: Rect, b: Rect, pad: number): boolean {
  return (
    a.x - pad < b.x + b.w &&
    a.x + a.w + pad > b.x &&
    a.y - pad < b.y + b.h &&
    a.y + a.h + pad > b.y
  );
}

/** pos를 방향(dx, dy)으로 amount만큼 밀어냄 */
function pushAway(
  pos: Position,
  dx: number,
  dy: number,
  amount: number,
): void {
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  pos.x += (dx / dist) * amount;
  pos.y += (dy / dist) * amount;
}

/** 월 번호 기반 고정 초기 위치 */
function getBasePosition(month: number): Position {
  const r1 = seededRandom(String(month) + 'x');
  const r2 = seededRandom(String(month) + 'y');
  const angle = ((month - 1) / 12) * Math.PI * 2 + (r1 - 0.5) * 0.5;
  const radius = 100 + r2 * 130;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * 0.35,
  };
}

/** 새 그룹의 위치를 기존 그룹과 겹치지 않도록 조정 */
function resolveNewGroup(
  newPos: Position,
  newWidth: number,
  existingPositions: ExistingGroup[],
): Position {
  const pos = { ...newPos };
  const deckRect: Rect = { x: -DECK_W / 2, y: -DECK_H / 2, w: DECK_W, h: DECK_H };

  const toRect = (cx: number, cy: number, w: number): Rect => ({
    x: cx - w / 2,
    y: cy - CARD_H / 2,
    w,
    h: CARD_H,
  });

  for (let iter = 0; iter < 50; iter++) {
    let moved = false;
    const newRect = toRect(pos.x, pos.y, newWidth);

    // 덱과 겹침
    if (rectsOverlap(newRect, deckRect, PADDING)) {
      pushAway(pos, pos.x || 0.1, pos.y || 0.1, 20);
      moved = true;
    }

    // 기존 그룹과 겹침
    for (const existing of existingPositions) {
      const curRect = toRect(pos.x, pos.y, newWidth);
      const existRect = toRect(existing.x, existing.y, existing.w);

      if (rectsOverlap(curRect, existRect, PADDING)) {
        pushAway(pos, pos.x - existing.x || 0.1, pos.y - existing.y || 0.1, 15);
        moved = true;
      }
    }

    if (!moved) break;
  }

  // 영역 경계 clamp
  const halfW = newWidth / 2;
  pos.x = Math.max(-BOUND_X + halfW, Math.min(BOUND_X - halfW, pos.x));
  pos.y = Math.max(-BOUND_Y + CARD_H / 2, Math.min(BOUND_Y - CARD_H / 2, pos.y));

  return pos;
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
 * positionCache를 읽기만 하고 새 캐시를 반환한다.
 * 호출 측에서 반환된 캐시로 ref를 교체해야 한다.
 */
export function computeGroupPositions(
  sortedGroups: MonthGroup[],
  prevCache: ReadonlyMap<string, Position>,
): { positions: Position[]; nextCache: Map<string, Position> } {
  const nextCache = new Map<string, Position>();
  const positions: Position[] = [];

  for (const [month, monthCards] of sortedGroups) {
    const cached = prevCache.get(month);

    if (cached) {
      nextCache.set(month, cached);
      positions.push(cached);
      continue;
    }

    // 이미 확정된 위치들 수집
    const existing: ExistingGroup[] = [];
    for (const [m, mc] of sortedGroups) {
      const pos = nextCache.get(m);
      if (pos) {
        existing.push({ ...pos, w: getGroupWidth(mc.length) });
      }
    }

    const basePos = getBasePosition(Number(month));
    const resolved = resolveNewGroup(basePos, getGroupWidth(monthCards.length), existing);

    nextCache.set(month, resolved);
    positions.push(resolved);
  }

  return { positions, nextCache };
}
