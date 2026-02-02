import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { PlayerArea } from './PlayerArea';
import { FieldArea } from './FieldArea';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { Player } from '../types/websocket';

interface GameState {
  userId: string;
  roomId: string;
  initialHasOpponent: boolean;
}

export const GameBoard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, roomId, initialHasOpponent } = location.state as GameState;
  const { player, opponent, field, deck, currentTurn, isGameStarted, reset } = useGameStore();
  const [opponentConnected, setOpponentConnected] = useState(initialHasOpponent);
  const [myReady, setMyReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [isPickingFirst, setIsPickingFirst] = useState(false);

  const myPlayer = userId === '1' ? Player.PLAYER_1 : Player.PLAYER_2;

  const handleOpponentConnect = useCallback((connectedPlayer: Player) => {
    // 자신이 아닌 다른 플레이어가 접속하면 상대방 연결로 처리
    if (connectedPlayer !== myPlayer) {
      setOpponentConnected(true);
    }
  }, [myPlayer]);

  const handlePlayerReady = useCallback((readyPlayer: Player) => {
    if (readyPlayer === myPlayer) {
      setMyReady(true);
    } else {
      setOpponentReady(true);
    }
  }, [myPlayer]);

  const handleGameStart = useCallback(() => {
    // 둘 다 준비 완료 -> 선공 정하기 화면으로
    setIsPickingFirst(true);
  }, []);

  const { isConnected, connectedPlayers, sendReady } = useGameWebSocket({
    userId,
    roomId,
    onOpponentConnect: handleOpponentConnect,
    onPlayerReady: handlePlayerReady,
    onGameStart: handleGameStart,
  });

  // 상대방 연결 여부: connectedPlayers에 2명 이상이거나 opponentConnected가 true
  const hasOpponent = opponentConnected || connectedPlayers.length >= 2;

  const handleReadyClick = () => {
    sendReady();
  };

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
            onClick={() => navigate('/')}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-semibold transition-colors"
          >
            나가기
          </button>
          {!isPickingFirst && !isGameStarted && (
            <button
              onClick={handleReadyClick}
              disabled={myReady || !hasOpponent}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg font-semibold transition-colors"
            >
              {myReady ? '준비 완료' : '준비'}
            </button>
          )}
          <button
            onClick={reset}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-semibold transition-colors"
          >
            리셋
          </button>
        </div>
      </div>

      {isGameStarted ? (
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
      ) : isPickingFirst ? (
        /* 선공 정하기 화면 */
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-white text-2xl font-bold mb-8">선공을 정합니다</p>
          <p className="text-gray-400 mb-8">카드를 선택하세요</p>
          <div className="flex gap-4">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="w-16 h-24 bg-blue-900 border-2 border-blue-700 rounded-lg cursor-pointer hover:border-yellow-400 transition-colors flex items-center justify-center"
              >
                <span className="text-blue-700 text-3xl">?</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 준비 대기 화면 */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-2xl font-bold mb-4">게임 대기 중</p>
            {!hasOpponent ? (
              <p className="text-gray-400">상대방을 기다리는 중...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-400">준비 버튼을 눌러주세요</p>
                <div className="flex justify-center gap-8 mt-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">나</p>
                    <p className={myReady ? 'text-green-400' : 'text-yellow-400'}>
                      {myReady ? '준비 완료' : '대기 중'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">상대방</p>
                    <p className={opponentReady ? 'text-green-400' : 'text-yellow-400'}>
                      {opponentReady ? '준비 완료' : '대기 중'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
