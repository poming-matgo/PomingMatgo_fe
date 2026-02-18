import { AnimatePresence, motion } from 'framer-motion';
import { DeckDisplay } from './DeckDisplay';
import { FloorCardGroup } from './FloorCardGroup';
import { useFloorGroupPositions } from './useFloorGroupPositions';
import { Card as CardComponent } from '../Card';
import { cardNameToCard } from '../../store/gameStore.helpers';
import type { Card } from '../../types/card';

interface FloorCardsAreaProps {
  cards: Card[];
  isDealing: boolean;
  dealingDone: boolean;
  deckCount: number;
  deckSampleCard?: Card;
  floorCardChoices?: string[] | null;
  onFloorCardSelect?: (cardIndex: number) => void;
}

export const FloorCardsArea = ({
  cards,
  isDealing,
  dealingDone,
  deckCount,
  deckSampleCard,
  floorCardChoices,
  onFloorCardSelect,
}: FloorCardsAreaProps) => {
  const { sortedGroups, positions } = useFloorGroupPositions(cards);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 덱: 컨테이너 정중앙 */}
      <div
        className="absolute z-10"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <DeckDisplay
          count={deckCount}
          sampleCard={deckSampleCard}
          isDealing={isDealing}
          dealingDone={dealingDone}
        />
      </div>

      {/* 바닥패: calc(50% + offset) 으로 배치 */}
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

      {/* 바닥 카드 선택 오버레이 */}
      <AnimatePresence>
        {floorCardChoices && floorCardChoices.length > 0 && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-black/70 backdrop-blur-sm rounded-xl px-6 py-4 flex flex-col items-center gap-3">
              <span className="text-white text-sm font-bold">가져갈 카드를 선택하세요</span>
              <div className="flex gap-4">
                {floorCardChoices.map((cardName, idx) => {
                  const card = cardNameToCard(cardName);
                  if (!card) return null;
                  return (
                    <motion.div
                      key={cardName}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <CardComponent
                        card={card}
                        onClick={() => onFloorCardSelect?.(idx)}
                        className="w-[72px] h-[108px] ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
