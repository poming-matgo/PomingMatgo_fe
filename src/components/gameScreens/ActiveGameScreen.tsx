import { PlayerArea } from '../PlayerArea';
import { FieldArea } from '../FieldArea';
import type { Player } from '../../types/game';
import type { Card } from '../../types/card';

interface ActiveGameScreenProps {
  player: Player;
  opponent: Player;
  field: Card[];
  deck: Card[];
  currentTurn: 'player' | 'opponent';
}

export const ActiveGameScreen = ({
  player,
  opponent,
  field,
  deck,
  currentTurn,
}: ActiveGameScreenProps) => {
  return (
    <>
      {/* 현재 턴 표시 */}
      <div className="text-center">
        <div className="inline-block px-4 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full">
          {currentTurn === 'player' ? '내 차례' : '상대방 차례'}
        </div>
      </div>

      {/* 상대방 영역 */}
      <div className="flex-1">
        <PlayerArea player={opponent} isOpponent />
      </div>

      {/* 중앙 영역 (바닥 패 + 덱) */}
      <div className="flex-shrink-0">
        <FieldArea fieldCards={field} deckCount={deck.length} />
      </div>

      {/* 플레이어 영역 */}
      <div className="flex-1">
        <PlayerArea player={player} />
      </div>
    </>
  );
};