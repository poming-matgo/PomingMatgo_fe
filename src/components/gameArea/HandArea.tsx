import { AnimatePresence } from 'framer-motion';
import { AnimatedCard } from './AnimatedCard';
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

const PLAYER_CARD = 'w-[60px] h-[90px]';
const OPPONENT_CARD = 'w-[44px] h-[66px]';
const PLAYER_HEIGHT = 'h-[184px]';
const OPPONENT_HEIGHT = 'h-[136px]';
const ROW_SIZE = 5;

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
  const fixedHeight = isOpponent ? OPPONENT_HEIGHT : PLAYER_HEIGHT;

  const allCards: { card: CardData; idx: number; faceDown: boolean }[] = isOpponent
    ? Array.from({ length: typeof visibleCards === 'number' ? visibleCards : 0 }).map((_, idx) => ({
        card: player.hand[idx],
        idx,
        faceDown: true,
      }))
    : (Array.isArray(visibleCards) ? visibleCards : []).map((card, idx) => ({
        card,
        idx,
        faceDown: false,
      }));

  const rows = [allCards.slice(0, ROW_SIZE), allCards.slice(ROW_SIZE)];

  return (
    <div className={`flex flex-col gap-0.5 justify-start ${fixedHeight}`}>
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-5 gap-0.5">
          <AnimatePresence mode="popLayout">
            {row.map(({ card, idx, faceDown }) => (
              <AnimatedCard
                key={card.name}
                card={card}
                faceDown={faceDown}
                isDealing={isDealing}
                dealingDone={dealingDone}
                animationY={animationY}
                cardSize={cardSize}
                currentTurn={currentTurn}
                onCardClick={onCardClick ? () => onCardClick(idx) : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
