import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../Card';
import { CARD_OVERLAP, CARD_H, CARD_W } from './floorLayout';
import type { Card as CardData } from '../../types/card';
import type { Position } from './floorLayout';

interface FloorCardGroupProps {
  month: string;
  cards: CardData[];
  position: Position;
  zIndex: number;
}

export const FloorCardGroup = memo(function FloorCardGroup({
  month,
  cards,
  position,
  zIndex,
}: FloorCardGroupProps) {
  // position = 슬롯 중심 좌표 → 왼쪽 상단 오프셋으로 변환
  // 첫 번째 카드 중심이 슬롯 중심에 오도록 배치
  // CARD_W/2는 카드 수와 무관 → 기존 카드 이동 없음
  const offsetX = position.x - CARD_W / 2;
  const offsetY = position.y - CARD_H / 2;

  return (
    <motion.div
      key={month}
      className="absolute flex"
      style={{
        left: `calc(50% + ${offsetX}px)`,
        top: `calc(50% + ${offsetY}px)`,
        zIndex,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
        <AnimatePresence mode="popLayout">
          {cards.map((card, idx) => (
            <motion.div
              key={card.name}
              style={{ marginLeft: idx === 0 ? 0 : -CARD_OVERLAP, zIndex: idx }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Card card={card} style={{ width: CARD_W, height: CARD_H }} />
            </motion.div>
          ))}
        </AnimatePresence>
    </motion.div>
  );
});
