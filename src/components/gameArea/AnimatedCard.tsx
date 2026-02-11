import { motion } from 'framer-motion';
import { Card } from '../Card';
import type { Card as CardData } from '../../types/card';

interface AnimatedCardProps {
  card: CardData;
  faceDown: boolean;
  isDealing: boolean;
  dealingDone: boolean;
  animationY: number;
  cardSize: string;
  currentTurn: 'player' | 'opponent';
  onCardClick?: () => void;
}

export const AnimatedCard = ({
  card,
  faceDown,
  isDealing,
  dealingDone,
  animationY,
  cardSize,
  currentTurn,
  onCardClick,
}: AnimatedCardProps) => {
  const cardElement = faceDown ? (
    <Card card={card} faceDown className={cardSize} />
  ) : (
    <Card
      card={card}
      className={cardSize}
      layoutId={`card-${card.name}`}
      onClick={currentTurn === 'player' ? onCardClick : undefined}
    />
  );

  if (isDealing && !dealingDone) {
    return (
      <motion.div
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
