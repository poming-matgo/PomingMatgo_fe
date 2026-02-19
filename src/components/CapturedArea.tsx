import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { CardType } from '../types/game';
import type { CapturedCards } from '../types/game';
import type { Card as CardData } from '../types/card';

// --- Constants ---
const PI_ROW_MAX = 13;
const CARD_WIDTH = 35;
const CARD_OVERLAP = -20;
const VISIBLE_PER_CARD = CARD_WIDTH + CARD_OVERLAP; // 겹쳐서 보이는 폭 (12px)

// 열별 고정 너비: 첫 카드 전체 + (최대장수-1) * 겹침폭
const GWANG_MAX = 5;
const KKUT_DDI_MAX = 10;
const GWANG_COL_WIDTH = CARD_WIDTH + (GWANG_MAX - 1) * VISIBLE_PER_CARD;     // 80px
const KKUT_DDI_COL_WIDTH = CARD_WIDTH + (KKUT_DDI_MAX - 1) * VISIBLE_PER_CARD; // 140px

const CARD_HEIGHT = 65;
const CARD_STYLE = { width: CARD_WIDTH, height: CARD_HEIGHT } as const;
const ROW_MIN_HEIGHT = `min-h-[${CARD_HEIGHT}px]`;
const ROW_CLASSES = `flex items-center ${ROW_MIN_HEIGHT}`;

// --- Sub Components ---
const CardStack = ({ cards }: { cards: CardData[] }) => (
  <div className="flex items-center">
    <AnimatePresence mode="popLayout">
      {cards.map((card, idx) => (
        <motion.div
          key={card.name}
          className="relative"
          style={{
            marginLeft: idx === 0 ? 0 : CARD_OVERLAP,
            zIndex: idx,
          }}
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <Card card={card} className="shrink-0" style={CARD_STYLE} layoutId={`card-${card.name}`} />
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// --- Main Component ---
export const CapturedArea = ({ captured }: { captured: CapturedCards }) => {
  const gwangCards = captured[CardType.GWANG];
  const kkutCards = captured[CardType.KKUT];
  const ddiCards = captured[CardType.DDI];
  const piCards = captured[CardType.PI];

  const piBottomRow = piCards.slice(0, PI_ROW_MAX);
  const piTopRow = piCards.slice(PI_ROW_MAX);

  return (
    <div
      className="grid grid-rows-2 gap-x-4 gap-y-1 w-full items-center"
      style={{ gridTemplateColumns: `${GWANG_COL_WIDTH}px ${KKUT_DDI_COL_WIDTH}px 1fr` }}
    >
      {/* Row 1: 광, 끗, 피 overflow */}
      <div className={ROW_CLASSES}>
        {gwangCards.length > 0 && <CardStack cards={gwangCards} />}
      </div>
      <div className={ROW_CLASSES}>
        {kkutCards.length > 0 && <CardStack cards={kkutCards} />}
      </div>
      <div className={ROW_CLASSES}>
        {piTopRow.length > 0 && <CardStack cards={piTopRow} />}
      </div>

      {/* Row 2: 그리드 정렬용 빈 셀(광 열 아래), 띠, 피 메인 */}
      <div aria-hidden="true" />
      <div className={ROW_CLASSES}>
        {ddiCards.length > 0 && <CardStack cards={ddiCards} />}
      </div>
      <div className={`${ROW_CLASSES} gap-1`}>
        {piBottomRow.length > 0 && <CardStack cards={piBottomRow} />}
        {piCards.length > 0 && (
          <div className="bg-gray-800 text-white text-xs font-bold rounded px-1.5 py-0.5 min-w-[20px] text-center">
            {piCards.length}
          </div>
        )}
      </div>
    </div>
  );
};
