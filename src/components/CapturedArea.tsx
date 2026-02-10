import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import type { CapturedCards } from '../types/game';
import type { Card as CardData } from '../types/card';
import { CardType } from '../types/game';

interface CapturedAreaProps {
  captured: CapturedCards;
}

const PI_ROW_MAX = 10;

const CardStack = ({ cards, cardSize }: { cards: CardData[]; cardSize: string }) => (
  <div className="flex items-center">
    <AnimatePresence mode="popLayout">
      {cards.map((card, idx) => (
        <motion.div
          key={card.name}
          className="relative"
          style={{
            marginLeft: idx === 0 ? '0' : '-22px',
            zIndex: idx,
          }}
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <Card card={card} className={cardSize} layoutId={`card-${card.name}`} />
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export const CapturedArea = ({ captured }: CapturedAreaProps) => {
  const gwangCards = captured[CardType.GWANG];
  const kkutCards = captured[CardType.KKUT];
  const ddiCards = captured[CardType.DDI];
  const piCards = captured[CardType.PI];

  // 피: 아래줄 최대 10개, 나머지는 위줄
  const piBottomRow = piCards.slice(0, PI_ROW_MAX);
  const piTopRow = piCards.slice(PI_ROW_MAX);

  const cardSize = 'w-9 h-[54px]';

  return (
    <div className="grid grid-rows-2 grid-cols-[auto_auto_1fr] gap-x-2 gap-y-1 w-full items-center">
      {/* Row 1: 광, 끗, 피 overflow */}
      <div className="min-h-[58px] flex items-center">
        {gwangCards.length > 0 && <CardStack cards={gwangCards} cardSize={cardSize} />}
      </div>
      <div className="min-h-[58px] flex items-center">
        {kkutCards.length > 0 && <CardStack cards={kkutCards} cardSize={cardSize} />}
      </div>
      <div className="min-h-[58px] flex items-center justify-end">
        {piTopRow.length > 0 && <CardStack cards={piTopRow} cardSize={cardSize} />}
      </div>

      {/* Row 2: 빈칸, 띠, 피 메인 */}
      <div />
      <div className="min-h-[58px] flex items-center">
        {ddiCards.length > 0 && <CardStack cards={ddiCards} cardSize={cardSize} />}
      </div>
      <div className="min-h-[58px] flex items-center justify-end gap-1">
        {piBottomRow.length > 0 && <CardStack cards={piBottomRow} cardSize={cardSize} />}
        {piCards.length > 0 && (
          <div className="bg-gray-800 text-white text-xs font-bold rounded px-1.5 py-0.5 min-w-[20px] text-center">
            {piCards.length}
          </div>
        )}
      </div>
    </div>
  );
};
