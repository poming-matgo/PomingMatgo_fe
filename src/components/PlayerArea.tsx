import { Card } from './Card';
import { CapturedArea } from './CapturedArea';
import type { Player } from '../types/game';

interface PlayerAreaProps {
  player: Player;
  isOpponent?: boolean;
}

export const PlayerArea = ({ player, isOpponent = false }: PlayerAreaProps) => {
  return (
    <div className="flex gap-4 w-full">
      {/* 손패 영역 */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-white font-bold">
            {isOpponent ? '상대방 손패' : '내 손패'}
          </div>
          <div className="text-yellow-400 font-bold text-lg">
            {player.score}점
          </div>
        </div>
        <div className="bg-gray-700 bg-opacity-40 p-2 rounded-lg">
          <div className="flex gap-1 justify-center">
            {player.hand.map((card, idx) => (
              <Card
                key={`${card.name}-${idx}`}
                card={card}
                faceDown={isOpponent}
                onClick={!isOpponent ? () => console.log('Card clicked:', card) : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 획득 패 영역 */}
      <div className="flex-1">
        <CapturedArea
          captured={player.captured}
          label={isOpponent ? '상대방 획득 패' : '내 획득 패'}
        />
      </div>
    </div>
  );
};
