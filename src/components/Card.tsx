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

// 월별 색상 (화투 카드 테마)
const getMonthColor = (month: number): string => {
  const colors: Record<number, string> = {
    1: 'bg-red-100 border-red-400',      // 1월 - 송학
    2: 'bg-pink-100 border-pink-400',    // 2월 - 매조
    3: 'bg-pink-200 border-pink-500',    // 3월 - 벚꽃
    4: 'bg-gray-100 border-gray-400',    // 4월 - 흑싸리
    5: 'bg-purple-100 border-purple-400', // 5월 - 난초
    6: 'bg-blue-100 border-blue-400',    // 6월 - 모란
    7: 'bg-red-200 border-red-500',      // 7월 - 홍싸리
    8: 'bg-yellow-100 border-yellow-400', // 8월 - 공산
    9: 'bg-amber-100 border-amber-400',  // 9월 - 국화
    10: 'bg-orange-100 border-orange-400', // 10월 - 단풍
    11: 'bg-green-100 border-green-400',  // 11월 - 오동
    12: 'bg-slate-200 border-slate-400'   // 12월 - 비
  };
  return colors[month] || 'bg-white border-gray-300';
};

// 카드 타입 아이콘
const getTypeIcon = (type: Type): string => {
  const icons: Record<Type, string> = {
    [Type.GWANG]: '🌟',  // 광
    [Type.KKUT]: '🎴',   // 끗
    [Type.DDI]: '🎋',    // 띠
    [Type.PI]: '🍃'      // 피
  };
  return icons[type];
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
          : getMonthColor(card.month)
        }
        ${className}
      `}
    >
      {faceDown ? (
        <div className="text-white text-2xl font-bold">花</div>
      ) : (
        <>
          <div className="text-2xl">{getTypeIcon(card.type)}</div>
          {card.specialType && (
            <div className="absolute top-0 right-0 bg-yellow-400 text-xs px-1 rounded-bl">
              ★
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
