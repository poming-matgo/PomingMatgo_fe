import { AnimatePresence } from 'framer-motion';
import { DeckDisplay } from './DeckDisplay';
import { FloorCardGroup } from './FloorCardGroup';
import { useFloorGroupPositions } from './useFloorGroupPositions';
import type { Card } from '../../types/card';

interface FloorCardsAreaProps {
  cards: Card[];
  isDealing: boolean;
  dealingDone: boolean;
  deckCount: number;
  deckSampleCard?: Card;
}

export const FloorCardsArea = ({
  cards,
  isDealing,
  dealingDone,
  deckCount,
  deckSampleCard,
}: FloorCardsAreaProps) => {
  const { sortedGroups, positions } = useFloorGroupPositions(cards);

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

      {/* 바닥패: 월별 그룹 단위로 흩뿌리기 */}
      <AnimatePresence>
        {sortedGroups.map(([month, monthCards], groupIdx) => {
          const pos = positions[groupIdx];
          if (!pos) return null;

          return (
            <FloorCardGroup
              key={month}
              month={month}
              cards={monthCards}
              position={pos}
              zIndex={groupIdx}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};
