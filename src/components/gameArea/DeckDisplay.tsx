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
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative w-[56px] h-[84px]">
        {count > 0 && sampleCard && (
          <>
            <div className="absolute top-1.5 left-1.5 w-[56px] h-[84px] bg-blue-900 rounded-lg opacity-40" />
            <div className="absolute top-1 left-1 w-[56px] h-[84px] bg-blue-900 rounded-lg opacity-60" />
            <Card card={sampleCard} faceDown className="relative w-[56px] h-[84px]" />
          </>
        )}
      </div>
      {isDealing && !dealingDone ? (
        <motion.div
          key={count}
          initial={{ scale: 1.3, color: '#fbbf24' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.3 }}
          className="text-white text-[10px] font-bold"
        >
          {count}
        </motion.div>
      ) : (
        <div className="text-white/60 text-[10px]">{count}</div>
      )}
    </div>
  );
};
