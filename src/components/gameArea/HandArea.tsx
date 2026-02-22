import { AnimatePresence } from 'framer-motion';
import { AnimatedCard } from './AnimatedCard';
import type { Card as CardData } from '../../types/card';

interface HandAreaProps {
  cards: CardData[];
  isOpponent: boolean;
  isDealing: boolean;
  dealingDone: boolean;
  currentTurn: 'player' | 'opponent';
  onCardClick?: (cardName: string) => void;
}

const PLAYER_CARD_SIZE = { w: 60, h: 90 };
const OPPONENT_CARD_SIZE = { w: 44, h: 66 };
const COLS = 5;
const GAP = 2;

export const HandArea = ({
  cards,
  isOpponent,
  isDealing,
  dealingDone,
  currentTurn,
  onCardClick,
}: HandAreaProps) => {
  const animationY = isOpponent ? 50 : -50;
  const { w, h } = isOpponent ? OPPONENT_CARD_SIZE : PLAYER_CARD_SIZE;
  
  const rows = 2;
  const gridHeight = rows * h + (rows - 1) * GAP;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, ${w}px)`,
        gridAutoRows: `${h}px`,
        gap: `${GAP}px`,
        height: `${gridHeight}px`,
        transition: 'height 0.3s ease'
      }}
    >
      <AnimatePresence mode="popLayout">
        {cards.map((card, idx) => {
          const key = isOpponent ? `opponent-${idx}` : card.name;
          return (
            <AnimatedCard
              key={key}
              card={card}
              faceDown={isOpponent}
              isDealing={isDealing}
              dealingDone={dealingDone}
              animationY={animationY}
              width={w}
              height={h}
              currentTurn={currentTurn}
              onCardClick={onCardClick ? () => onCardClick(card.name) : undefined}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};