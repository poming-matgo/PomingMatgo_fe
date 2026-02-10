import { motion } from 'framer-motion';
import { Card } from '../Card';
import { CapturedArea } from '../CapturedArea';
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

export const HandArea = ({
  player,
  isOpponent,
  visibleCards,
  isDealing,
  dealingDone,
  currentTurn,
  onCardClick,
}: HandAreaProps) => {
  const label = isOpponent ? '상대방 손패' : '내 손패';
  const capturedLabel = isOpponent ? '상대방 획득 패' : '내 획득 패';
  const animationY = isOpponent ? 50 : -50; // 상대방: 아래→위, 플레이어: 위→아래

  // 렌더링할 카드 결정
  const renderCards = () => {
    if (isOpponent) {
      // 상대방: visibleCards는 숫자
      const count = typeof visibleCards === 'number' ? visibleCards : 0;
      return Array.from({ length: count }).map((_, idx) => {
        const card = player.hand[idx];
        return isDealing && !dealingDone ? (
          <motion.div
            key={`opponent-${idx}`}
            initial={{ opacity: 0, y: animationY, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Card card={card} faceDown />
          </motion.div>
        ) : (
          <Card key={`opponent-${idx}`} card={card} faceDown />
        );
      });
    } else {
      // 플레이어: visibleCards는 CardData[]
      const cards = Array.isArray(visibleCards) ? visibleCards : [];
      return cards.map((card, idx) =>
        isDealing && !dealingDone ? (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: animationY, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Card card={card} layoutId={`card-${card.name}`} />
          </motion.div>
        ) : (
          <Card
            key={card.name}
            card={card}
            layoutId={`card-${card.name}`}
            onClick={
              currentTurn === 'player' && onCardClick
                ? () => onCardClick(idx)
                : undefined
            }
          />
        )
      );
    }
  };

  return (
    <div className="flex-1 flex gap-4 w-full">
      {/* 손패 */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="text-white font-bold text-sm">{label}</div>
          <div className="text-yellow-400 font-bold text-lg">{player.score}점</div>
        </div>
        <div className="bg-gray-700 bg-opacity-40 p-2 rounded-lg min-h-[100px] flex items-center">
          <div className="flex gap-1 justify-center w-full">
            {renderCards()}
          </div>
        </div>
      </div>
      {/* 획득 패 */}
      <div className="flex-1">
        <CapturedArea captured={player.captured} label={capturedLabel} />
      </div>
    </div>
  );
};
