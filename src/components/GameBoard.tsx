import { useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { PlayerArea } from './PlayerArea';
import { FieldArea } from './FieldArea';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import type { Player } from '../types/websocket';

interface GameBoardProps {
  userId: string;
  roomId: string;
  initialHasOpponent: boolean;
  onBackToLobby: () => void;
}

export const GameBoard = ({ userId, roomId, initialHasOpponent, onBackToLobby }: GameBoardProps) => {
  const { player, opponent, field, deck, currentTurn, initializeGame, reset } = useGameStore();
  const [opponentConnected, setOpponentConnected] = useState(initialHasOpponent);

  const handleOpponentConnect = useCallback((connectedPlayer: Player) => {
    // 자신이 아닌 다른 플레이어가 접속하면 상대방 연결로 처리
    const myPlayer = userId === '1' ? 'PLAYER_1' : 'PLAYER_2';
    if (connectedPlayer !== myPlayer) {
      setOpponentConnected(true);
    }
  }, [userId]);

  const { isConnected, connectedPlayers } = useGameWebSocket({
    userId,
    roomId,
    onOpponentConnect: handleOpponentConnect,
  });

  // 상대방 연결 여부: connectedPlayers에 2명 이상이거나 opponentConnected가 true
  const hasOpponent = opponentConnected || connectedPlayers.length >= 2;

  return (
    <div className="w-[1400px] h-[700px] bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-3 flex flex-col gap-2 overflow-hidden">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-xl font-bold">포밍맞고 (PomingMatgo)</h1>
          <span className="text-gray-300 text-sm">Player {userId}</span>
          <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'WS 연결됨' : 'WS 연결 중...'}
          </span>
          {!hasOpponent && (
            <span className="text-yellow-400 text-sm">상대방 대기 중...</span>
          )}
          {hasOpponent && (
            <span className="text-green-400 text-sm">게임 준비 완료</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBackToLobby}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-semibold transition-colors"
          >
            나가기
          </button>
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
