import { useMemo } from 'react';
import { motion, type Variants, type Transition } from 'framer-motion';
import { Card } from '../Card';
import type { Card as CardData } from '../../types/card';

interface AnimatedCardProps {
  card: CardData;
  faceDown: boolean;
  isDealing: boolean;
  dealingDone: boolean;
  animationY: number;
  width: number;
  height: number;
  currentTurn: 'player' | 'opponent';
  onCardClick?: () => void;
}

export const AnimatedCard = ({
  card,
  faceDown,
  isDealing,
  dealingDone,
  animationY,
  width,
  height,
  currentTurn,
  onCardClick,
}: AnimatedCardProps) => {
  const handleClick = currentTurn === 'player' && !faceDown ? onCardClick : undefined;
  
  // 상태에 따른 Variants 결정
  const isDealingPhase = isDealing && !dealingDone;
  
  const currentVariants: Variants = isDealingPhase
    ? {
        initial: { opacity: 0, y: animationY, scale: 0.3 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
      }
    : {
        initial: { opacity: 1, scale: 1, y: 0 }, // idle 상태의 초기값 명시
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, y: animationY, scale: 0.5, transition: { duration: 0.25 } },
      };

  const currentTransition: Transition = isDealingPhase
    ? { duration: 0.3, ease: 'easeOut' }
    : { layout: { type: 'spring', stiffness: 300, damping: 30 } };

  return (
    <motion.div
      layout // 딜링 중에도 layout이 있어야 Grid 정렬 시 부드러움
      variants={currentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={currentTransition}
      style={{ width, height }}
      className="relative"
    >
      <div style={{ width: '100%', height: '100%' }}>
        {faceDown ? (
            <Card card={card} faceDown className="w-full h-full" />
        ) : (
            <Card
            card={card}
            className="w-full h-full"
            layoutId={`card-${card.name}`}
            onClick={handleClick}
            />
        )}
      </div>
    </motion.div>
  );
};