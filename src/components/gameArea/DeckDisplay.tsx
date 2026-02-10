import { motion } from 'framer-motion';
import { Card } from '../Card';
import type { Card as CardData } from '../../types/card';

interface DeckDisplayProps {
  count: number;
  sampleCard?: CardData;
  isDealing: boolean;
  dealingDone: boolean;
}

export const DeckDisplay = ({ count, sampleCard, isDealing, dealingDone }: DeckDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-white text-sm font-bold">덱</div>
      <div className="relative w-16 h-24">
        {count > 0 && sampleCard && (
          <>
            <div className="absolute top-1 left-1 w-16 h-24 bg-blue-900 rounded-lg opacity-40" />
            <div className="absolute top-0.5 left-0.5 w-16 h-24 bg-blue-900 rounded-lg opacity-60" />
            <Card card={sampleCard} faceDown className="relative" />
          </>
        )}
      </div>
      {isDealing && !dealingDone ? (
        <motion.div
          key={count}
          initial={{ scale: 1.3, color: '#fbbf24' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.3 }}
          className="text-white text-xs font-bold"
        >
          남은 카드: {count}장
        </motion.div>
      ) : (
        <div className="text-white text-xs">남은 카드: {count}장</div>
      )}
    </div>
  );
};
