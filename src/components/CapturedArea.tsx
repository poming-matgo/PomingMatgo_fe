import { Card } from './Card';
import type { CapturedCards } from '../types/game';
import type { Card as CardData } from '../types/card';
import { CardType } from '../types/game';

interface CapturedAreaProps {
  captured: CapturedCards;
  label: string;
}

const cardTypeLabels: Record<CardType, string> = {
  [CardType.GWANG]: '광',
  [CardType.KKUT]: '끗',
  [CardType.DDI]: '띠',
  [CardType.PI]: '피'
};

export const CapturedArea = ({ captured, label }: CapturedAreaProps) => {
  return (
    <div className="flex flex-col gap-1 bg-gray-800 bg-opacity-50 p-2 rounded-lg">
      <div className="text-white text-xs font-bold">{label}</div>
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(cardTypeLabels).map(([type, typeLabel]) => (
          <div key={type} className="flex flex-col items-center gap-1">
            <div className="text-white text-xs font-semibold">{typeLabel}</div>
            <div className="flex justify-center min-h-[70px] bg-gray-900 bg-opacity-30 p-1 rounded relative">
              {captured[type as CardType].length === 0 ? (
                <div className="text-gray-500 text-xs flex items-center">-</div>
              ) : (
                <div className="flex relative">
                  {captured[type as CardType].map((card: CardData, idx: number) => (
                    <div
                      key={`${card.name}-${idx}`}
                      className="relative"
                      style={{ marginLeft: idx === 0 ? '0' : '-32px' }}
                    >
                      <Card card={card} className="w-12 h-16 text-xs" layoutId={`card-${card.name}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-white text-xs">
              ({captured[type as CardType].length})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
