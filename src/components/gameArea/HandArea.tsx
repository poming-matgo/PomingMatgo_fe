import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../Card';
import type { Player } from '../../types/game';
import type { Card as CardData } from '../../types/card';

interface HandAreaProps {
  player: Player;
  isOpponent: boolean;
  visibleCards: CardData[] | number;
  isDealing: boolean;
  dealingDone: boolean;
  currentTurn: 'player' | 'opponent';
  onCardClick?: (cardIndex: number) => void;
}

// 플레이어: 60×90, 상대방: 44×66
const PLAYER_CARD = 'w-[60px] h-[90px]';
const OPPONENT_CARD = 'w-[44px] h-[66px]';

// 고정 높이: 2줄 기준 (카드높이 * 2 + gap)
const PLAYER_HEIGHT = 'h-[184px]';   // 90*2 + 4
const OPPONENT_HEIGHT = 'h-[136px]'; // 66*2 + 4

export const HandArea = ({
  player,
  isOpponent,
  visibleCards,
  isDealing,
  dealingDone,
  currentTurn,
  onCardClick,
}: HandAreaProps) => {
  const animationY = isOpponent ? 50 : -50;
  const cardSize = isOpponent ? OPPONENT_CARD : PLAYER_CARD;

  const renderCard = (card: CardData, idx: number, faceDown: boolean) => {
    const key = faceDown ? `opponent-${idx}` : card.name;

    const cardElement = faceDown ? (
      <Card card={card} faceDown className={cardSize} />
    ) : (
      <Card
        card={card}
        className={cardSize}
        layoutId={`card-${card.name}`}
        onClick={
          currentTurn === 'player' && onCardClick
            ? () => onCardClick(idx)
            : undefined
        }
      />
    );

    if (isDealing && !dealingDone) {
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: animationY, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {cardElement}
        </motion.div>
      );
    }

    return (
      <motion.div
        key={key}
        layout
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, y: animationY, scale: 0.5, transition: { duration: 0.25 } }}
        transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }}
      >
        {cardElement}
      </motion.div>
    );
  };

  const getCards = (): { card: CardData; idx: number; faceDown: boolean }[] => {
    if (isOpponent) {
      const count = typeof visibleCards === 'number' ? visibleCards : 0;
      return Array.from({ length: count }).map((_, idx) => ({
        card: player.hand[idx],
        idx,
        faceDown: true,
      }));
    } else {
      const cards = Array.isArray(visibleCards) ? visibleCards : [];
      return cards.map((card, idx) => ({ card, idx, faceDown: false }));
    }
  };

  const allCards = getCards();
  const ROW_SIZE = 5;
  const topRow = allCards.slice(0, ROW_SIZE);
  const bottomRow = allCards.slice(ROW_SIZE);
  const fixedHeight = isOpponent ? OPPONENT_HEIGHT : PLAYER_HEIGHT;

  return (
    <div className={`flex flex-col gap-0.5 justify-start ${fixedHeight}`}>
      <div className="grid grid-cols-5 gap-0.5">
        <AnimatePresence mode="popLayout">
          {topRow.map(({ card, idx, faceDown }) => renderCard(card, idx, faceDown))}
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-5 gap-0.5">
        <AnimatePresence mode="popLayout">
          {bottomRow.map(({ card, idx, faceDown }) => renderCard(card, idx, faceDown))}
        </AnimatePresence>
      </div>
    </div>
  );
};
