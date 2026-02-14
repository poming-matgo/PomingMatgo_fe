import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../Card';
import { CARD_OVERLAP } from './floorLayout';
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
  return (
    <motion.div
      key={month}
      className="absolute flex"
      style={{ zIndex }}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
      animate={{ opacity: 1, x: position.x, y: position.y, scale: 1 }}
      exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.25 } }}
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
            <Card card={card} className="w-[46px] h-[67px]" layoutId={`card-${card.name}`} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
});
