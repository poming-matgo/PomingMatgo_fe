import { useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../Card';
import { DeckDisplay } from './DeckDisplay';
import { groupCardsByMonth } from '../../utils/cardGrouping';
import type { Card as CardData } from '../../types/card';

interface FloorCardsAreaProps {
  cards: CardData[];
  isDealing: boolean;
  dealingDone: boolean;
  deckCount: number;
  deckSampleCard?: CardData;
}

const CARD_W = 56;
const CARD_H = 84;
const CARD_OVERLAP = 28;
const PADDING = 12;
const DECK_W = 120;
const DECK_H = 140;

// 바닥 영역 경계 (중앙 기준 ±)
const BOUND_X = 420;
const BOUND_Y = 110;

/** 결정적 랜덤 (시드 기반) */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return ((hash & 0x7fffffff) % 1000) / 1000;
}

/** 그룹의 픽셀 너비 계산 */
function getGroupWidth(cardCount: number): number {
  return CARD_W + Math.max(0, cardCount - 1) * CARD_OVERLAP;
}

interface Rect {
  x: number; y: number; w: number; h: number;
}

/** 두 rect가 겹치는지 (padding 포함) */
function rectsOverlap(a: Rect, b: Rect, pad: number): boolean {
  return (
    a.x - pad < b.x + b.w &&
    a.x + a.w + pad > b.x &&
    a.y - pad < b.y + b.h &&
    a.y + a.h + pad > b.y
  );
}

/** 월 번호 기반 고정 초기 위치 (index/total에 의존하지 않음) */
function getBasePosition(month: number): { x: number; y: number } {
  const r1 = seededRandom(String(month) + 'x');
  const r2 = seededRandom(String(month) + 'y');
  // 월 번호(1~12)를 기준으로 고정 각도 배정
  const angle = ((month - 1) / 12) * Math.PI * 2 + (r1 - 0.5) * 0.5;
  const radius = 100 + r2 * 130;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * 0.35,
  };
}

/**
 * 새로 등장한 그룹만 충돌 해소, 기존 그룹은 위치 유지
 */
function resolveNewGroup(
  newPos: { x: number; y: number },
  newWidth: number,
  existingPositions: { x: number; y: number; w: number }[]
): { x: number; y: number } {
  const pos = { ...newPos };
  const deckRect: Rect = { x: -DECK_W / 2, y: -DECK_H / 2, w: DECK_W, h: DECK_H };

  for (let iter = 0; iter < 50; iter++) {
    let moved = false;
    const newRect: Rect = {
      x: pos.x - newWidth / 2,
      y: pos.y - CARD_H / 2,
      w: newWidth,
      h: CARD_H,
    };

    // 덱과 겹침
    if (rectsOverlap(newRect, deckRect, PADDING)) {
      const dx = pos.x || 0.1;
      const dy = pos.y || 0.1;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      pos.x += (dx / dist) * 20;
      pos.y += (dy / dist) * 20;
      moved = true;
    }

    // 기존 그룹과 겹침
    for (const existing of existingPositions) {
      const existRect: Rect = {
        x: existing.x - existing.w / 2,
        y: existing.y - CARD_H / 2,
        w: existing.w,
        h: CARD_H,
      };
      const curRect: Rect = {
        x: pos.x - newWidth / 2,
        y: pos.y - CARD_H / 2,
        w: newWidth,
        h: CARD_H,
      };
      if (rectsOverlap(curRect, existRect, PADDING)) {
        const dx = pos.x - existing.x || 0.1;
        const dy = pos.y - existing.y || 0.1;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // 새 그룹만 밀어냄 (기존 그룹 위치 보존)
        pos.x += (dx / dist) * 15;
        pos.y += (dy / dist) * 15;
        moved = true;
      }
    }

    if (!moved) break;
  }

  // 영역 경계 clamp (카드가 잘리지 않도록)
  const halfW = newWidth / 2;
  pos.x = Math.max(-BOUND_X + halfW, Math.min(BOUND_X - halfW, pos.x));
  pos.y = Math.max(-BOUND_Y + CARD_H / 2, Math.min(BOUND_Y - CARD_H / 2, pos.y));

  return pos;
}

export const FloorCardsArea = ({
  cards,
  isDealing,
  dealingDone,
  deckCount,
  deckSampleCard,
}: FloorCardsAreaProps) => {
  // 월별 위치 캐시: 한번 배치된 월은 위치 고정
  const positionCacheRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const groupedFloorCards = useMemo(() => groupCardsByMonth(cards), [cards]);

  const sortedGroups = useMemo(
    () => Object.entries(groupedFloorCards).sort(([a], [b]) => Number(a) - Number(b)),
    [groupedFloorCards]
  );

  // 현재 바닥에 없는 월은 캐시에서 제거 (유저가 가져간 경우)
  const currentMonths = useMemo(() => new Set(sortedGroups.map(([m]) => m)), [sortedGroups]);
  for (const cachedMonth of positionCacheRef.current.keys()) {
    if (!currentMonths.has(cachedMonth)) {
      positionCacheRef.current.delete(cachedMonth);
    }
  }

  // 그룹 위치 계산: 캐시에 있으면 재사용, 없으면 새로 계산 후 캐시
  const groupPositions = useMemo(() => {
    const cache = positionCacheRef.current;

    return sortedGroups.map(([month, monthCards]) => {
      // 캐시에 있으면 그대로 반환
      if (cache.has(month)) {
        return cache.get(month)!;
      }

      // 기존 확정된 위치들 수집
      const existing = sortedGroups
        .filter(([m]) => cache.has(m))
        .map(([m, mc]) => ({
          ...cache.get(m)!,
          w: getGroupWidth(mc.length),
        }));

      // 월 기반 고정 초기 위치에서 출발, 기존 그룹과 충돌 해소
      const basePos = getBasePosition(Number(month));
      const resolved = resolveNewGroup(basePos, getGroupWidth(monthCards.length), existing);

      cache.set(month, resolved);
      return resolved;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedGroups]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 덱: 정중앙 */}
      <div className="absolute z-10">
        <DeckDisplay
          count={deckCount}
          sampleCard={deckSampleCard}
          isDealing={isDealing}
          dealingDone={dealingDone}
        />
      </div>

      {/* 바닥패: 월별 그룹 단위로 흩뿌리기, 그룹 내 카드는 일렬 */}
      <AnimatePresence>
        {sortedGroups.map(([month, monthCards], groupIdx) => {
          const pos = groupPositions[groupIdx];
          if (!pos) return null;

          const groupContent = (
            <AnimatePresence mode="popLayout">
              {monthCards.map((card, idx) => (
                <motion.div
                  key={card.name}
                  style={{ marginLeft: idx === 0 ? 0 : -CARD_OVERLAP, zIndex: idx }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Card card={card} className="w-[56px] h-[84px]" layoutId={`card-${card.name}`} />
                </motion.div>
              ))}
            </AnimatePresence>
          );

          return (
            <motion.div
              key={month}
              className="absolute flex"
              style={{ zIndex: groupIdx }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
              animate={{
                opacity: 1,
                x: pos.x,
                y: pos.y,
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.25 } }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {groupContent}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
