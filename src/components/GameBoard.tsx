import { useGameStore } from '../store/gameStore';
import { PlayerArea } from './PlayerArea';
import { FieldArea } from './FieldArea';

export const GameBoard = () => {
  const { player, opponent, field, deck, currentTurn, initializeGame, reset } = useGameStore();

  return (
    <div className="w-[1400px] h-[700px] bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-3 flex flex-col gap-2 overflow-hidden">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">포밍맞고 (PomingMatgo)</h1>
        <div className="flex gap-2">
          <button
            onClick={initializeGame}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-semibold transition-colors"
          >
            새 게임
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-semibold transition-colors"
          >
            리셋
          </button>
        </div>
      </div>

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
    </div>
  );
};
