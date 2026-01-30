import { Card } from './Card';
import type { Card as CardData } from '../types/card';

interface FieldAreaProps {
  fieldCards: CardData[];
  deckCount: number;
}

export const FieldArea = ({ fieldCards, deckCount }: FieldAreaProps) => {
  // 월별로 카드 그룹화
  const groupedByMonth = fieldCards.reduce((acc, card) => {
    if (!acc[card.month]) {
      acc[card.month] = [];
    }
    acc[card.month].push(card);
    return acc;
  }, {} as Record<number, CardData[]>);

  return (
    <div className="flex items-center justify-center gap-6 py-2">
      {/* 덱 (뒤집힌 패) */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-white text-sm font-bold">덱</div>
        <div className="relative w-16 h-24">
          {deckCount > 0 ? (
            <>
              {/* 쌓여있는 느낌 - 그림자 효과 */}
              <div className="absolute top-1 left-1 w-16 h-24 bg-blue-900 rounded-lg opacity-40"></div>
              <div className="absolute top-0.5 left-0.5 w-16 h-24 bg-blue-900 rounded-lg opacity-60"></div>
              <Card card={fieldCards[0]} faceDown className="relative" />
            </>
          ) : (
            <div className="w-16 h-24 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-xs">없음</span>
            </div>
          )}
        </div>
        <div className="text-white text-xs">남은 카드: {deckCount}장</div>
      </div>

      {/* 바닥 패 (월별 그룹) */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-white text-sm font-bold">바닥 패</div>
        <div className="bg-green-800 bg-opacity-60 p-3 rounded-lg min-w-[500px] min-h-[120px]">
          {fieldCards.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              바닥 패 없음
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.entries(groupedByMonth)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([month, cards]) => (
                  <div key={month} className="flex flex-col items-center gap-1">
                    <div className="text-white text-xs font-semibold">{month}월</div>
                    <div className="flex relative">
                      {cards.map((card, idx) => (
                        <div
                          key={`${card.name}-${idx}`}
                          className="relative"
                          style={{ marginLeft: idx === 0 ? '0' : '-44px' }}
                        >
                          <Card
                            card={card}
                            onClick={() => console.log('Field card clicked:', card)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
