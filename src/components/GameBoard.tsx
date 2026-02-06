import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { PlayerArea } from './PlayerArea';
import { FieldArea } from './FieldArea';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { Player } from '../types/websocket';
import type { LeaderSelectionResultData } from '../types/websocket';

interface GameState {
  userId: string;
  roomId: string;
  initialHasOpponent: boolean;
}

interface CardSelection {
  player: Player;
  cardIndex: number;
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

  // 선공 정하기 상태
  const [cardSelections, setCardSelections] = useState<CardSelection[]>([]);
  const [selectionResult, setSelectionResult] = useState<LeaderSelectionResultData | null>(null);

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

  const handleLeaderSelection = useCallback((selectedPlayer: Player, cardIndex: number) => {
    setCardSelections(prev => [...prev, { player: selectedPlayer, cardIndex }]);
  }, []);

  const handleLeaderSelectionResult = useCallback((data: LeaderSelectionResultData) => {
    setSelectionResult(data);
  }, []);

  const { isConnected, connectedPlayers, sendReady, sendLeaderSelection } = useGameWebSocket({
    userId,
    roomId,
    onOpponentConnect: handleOpponentConnect,
    onPlayerReady: handlePlayerReady,
    onGameStart: handleGameStart,
    onLeaderSelection: handleLeaderSelection,
    onLeaderSelectionResult: handleLeaderSelectionResult,
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
          {selectionResult ? (
            /* 결과 표시 */
            (() => {
              const myMonth = myPlayer === Player.PLAYER_1 ? selectionResult.player1Month : selectionResult.player2Month;
              const opponentMonth = myPlayer === Player.PLAYER_1 ? selectionResult.player2Month : selectionResult.player1Month;
              const myCardIndex = cardSelections.find(s => s.player === myPlayer)?.cardIndex;
              const opponentCardIndex = cardSelections.find(s => s.player !== myPlayer)?.cardIndex;
              const myCardName = myCardIndex !== undefined ? selectionResult.fiveCards[myCardIndex] : '';
              const opponentCardName = opponentCardIndex !== undefined ? selectionResult.fiveCards[opponentCardIndex] : '';
              const isMyLead = (myPlayer === Player.PLAYER_1 && selectionResult.leadPlayer === 1) ||
                               (myPlayer === Player.PLAYER_2 && selectionResult.leadPlayer === 2);

              return (
                <>
                  <p className="text-white text-2xl font-bold mb-4">선공 결정!</p>
                  <p className="text-yellow-400 text-xl mb-8">
                    {isMyLead ? '내가' : '상대방이'} 선입니다
                  </p>

                  {/* 플레이어 카드 결과 */}
                  <div className="flex justify-center gap-24 mb-8">
                    <div className="text-center">
                      <p className="text-gray-400 mb-2">상대방</p>
                      <div className="w-16 h-24 bg-white border-2 border-yellow-400 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-black text-xl font-bold">{opponentMonth}월</span>
                        <span className="text-gray-500 text-[10px]">{opponentCardName}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 mb-2">나</p>
                      <div className="w-16 h-24 bg-white border-2 border-yellow-400 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-black text-xl font-bold">{myMonth}월</span>
                        <span className="text-gray-500 text-[10px]">{myCardName}</span>
                      </div>
                    </div>
                  </div>

                  {/* 나머지 카드 뒤집기 */}
                  <p className="text-gray-400 mb-4">남은 카드</p>
                  <div className="flex gap-4">
                    {selectionResult.fiveCards
                      .filter((_, idx) => idx !== myCardIndex && idx !== opponentCardIndex)
                      .map((cardName, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-24 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center"
                        >
                          <span className="text-gray-600 text-xs text-center px-1">{cardName}</span>
                        </div>
                      ))}
                  </div>
                </>
              );
            })()
          ) : (
            /* 카드 선택 화면 */
            (() => {
              const mySelection = cardSelections.find(s => s.player === myPlayer);
              const opponentSelection = cardSelections.find(s => s.player !== myPlayer);

              return (
                <>
                  <p className="text-white text-2xl font-bold mb-4">선공을 정합니다</p>

                  {/* 상대방 선택 영역 */}
                  <div className="mb-8">
                    <p className="text-gray-400 text-center mb-2">상대방</p>
                    <div className={`w-16 h-24 rounded-lg flex items-center justify-center mx-auto transition-all duration-300
                      ${opponentSelection
                        ? 'bg-blue-900 border-2 border-blue-500'
                        : 'bg-gray-800 border-2 border-gray-600 border-dashed'}`}
                    >
                      {opponentSelection ? (
                        <span className="text-blue-300 text-3xl">?</span>
                      ) : (
                        <span className="text-gray-600 text-xs">대기 중</span>
                      )}
                    </div>
                  </div>

                  {/* 중앙 카드들 */}
                  <p className="text-gray-400 mb-4">카드를 선택하세요</p>
                  <div className="flex gap-4 mb-8">
                    {[0, 1, 2, 3, 4].map((index) => {
                      const isMyCard = mySelection?.cardIndex === index;
                      const isOpponentCard = opponentSelection?.cardIndex === index;
                      const isSelected = isMyCard || isOpponentCard;
                      const canSelect = !mySelection && !isOpponentCard;

                      return (
                        <div
                          key={index}
                          onClick={() => canSelect && sendLeaderSelection(index)}
                          className={`w-16 h-24 rounded-lg flex items-center justify-center transition-all duration-300
                            ${isSelected
                              ? 'opacity-0 scale-0'
                              : canSelect
                                ? 'bg-blue-900 border-2 border-blue-700 cursor-pointer hover:border-yellow-400 hover:scale-105'
                                : 'bg-gray-700 border-2 border-gray-600 cursor-not-allowed'
                            }`}
                        >
                          <span className="text-blue-300 text-3xl">?</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 내 선택 영역 */}
                  <div>
                    <p className="text-gray-400 text-center mb-2">나</p>
                    <div className={`w-16 h-24 rounded-lg flex items-center justify-center mx-auto transition-all duration-300
                      ${mySelection
                        ? 'bg-blue-900 border-2 border-green-500'
                        : 'bg-gray-800 border-2 border-gray-600 border-dashed'}`}
                    >
                      {mySelection ? (
                        <span className="text-blue-300 text-3xl">?</span>
                      ) : (
                        <span className="text-gray-600 text-xs">선택</span>
                      )}
                    </div>
                  </div>
                </>
              );
            })()
          )}
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
