import { motion } from 'framer-motion';
import type { Card as CardType } from '../types/card';
import { CardType as Type } from '../types/card';

interface CardProps {
  card: CardType;
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  layoutId?: string;
}

const getTypeLabel = (type: Type): string => {
  const labels: Record<Type, string> = {
    [Type.GWANG]: '광',
    [Type.KKUT]: '끗',
    [Type.DDI]: '띠',
    [Type.PI]: '피',
  };
  return labels[type];
};

export const Card = ({ card, faceDown = false, onClick, className = '', style, layoutId }: CardProps) => {
  return (
    <motion.div
      layoutId={layoutId}
      whileHover={{ scale: onClick ? 1.05 : 1 }}
      whileTap={{ scale: onClick ? 0.95 : 1 }}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={style}
      className={`
        relative w-[72px] h-[108px] rounded-lg border-2 shadow-md
        flex flex-col items-center justify-center
        ${onClick ? 'cursor-pointer' : ''}
        ${faceDown
          ? 'bg-gradient-to-br from-blue-900 to-blue-700 border-blue-800'
          : 'bg-white border-gray-300'
        }
        ${className}
      `}
    >
      {faceDown ? (
        <div className="text-white text-2xl font-bold">花</div>
      ) : (
        <>
          <div className="text-xs font-bold text-gray-800">{card.month}월</div>
          <div className="text-sm font-semibold text-gray-700">{getTypeLabel(card.type)}</div>
          <div className="text-[10px] text-gray-500">{card.name}</div>
          {card.specialType && (
            <div className="absolute top-0 right-0 bg-yellow-400 text-[8px] px-0.5 rounded-bl font-bold">
              {card.specialType}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
