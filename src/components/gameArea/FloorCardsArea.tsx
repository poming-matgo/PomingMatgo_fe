import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../Card';
import { groupCardsByMonth } from '../../utils/cardGrouping';
import type { Card as CardData } from '../../types/card';

interface FloorCardsAreaProps {
  cards: CardData[];
  isDealing: boolean;
  dealingDone: boolean;
}

export const FloorCardsArea = ({ cards, isDealing, dealingDone }: FloorCardsAreaProps) => {
  // useMemo로 최적화: cards가 변경될 때만 재계산
  const groupedFloorCards = useMemo(() => groupCardsByMonth(cards), [cards]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-white text-sm font-bold">바닥 패</div>
      <div className="bg-green-800 bg-opacity-60 p-3 rounded-lg min-w-[500px] min-h-[120px]">
        {cards.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            {isDealing ? '바닥 패 대기중...' : '바닥 패 없음'}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(groupedFloorCards)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([month, cards]) => (
                <div key={month} className="flex flex-col items-center gap-1">
                  <div className="text-white text-xs font-semibold">{month}월</div>
                  <div className="flex relative">
                    {cards.map((card, idx) =>
                      isDealing && !dealingDone ? (
                        <motion.div
                          key={card.name}
                          className="relative"
                          style={{ marginLeft: idx === 0 ? '0' : '-44px' }}
                          initial={{ opacity: 0, y: -30, scale: 0.3 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          <Card card={card} layoutId={`card-${card.name}`} />
                        </motion.div>
                      ) : (
                        <div
                          key={card.name}
                          className="relative"
                          style={{ marginLeft: idx === 0 ? '0' : '-44px' }}
                        >
                          <Card card={card} layoutId={`card-${card.name}`} />
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
