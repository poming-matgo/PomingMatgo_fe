interface GameHeaderProps {
  userId: string;
  isConnected: boolean;
  hasOpponent: boolean;
  isGameStarted: boolean;
  isPickingFirst: boolean;
  myReady: boolean;
  onExit: () => void;
  onReady: () => void;
  onReset: () => void;
}

export const GameHeader = ({
  userId,
  isConnected,
  hasOpponent,
  isGameStarted,
  isPickingFirst,
  myReady,
  onExit,
  onReady,
  onReset,
}: GameHeaderProps) => {
  return (
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
          onClick={onExit}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-semibold transition-colors"
        >
          나가기
        </button>
        {!isPickingFirst && !isGameStarted && (
          <button
            onClick={onReady}
            disabled={myReady || !hasOpponent}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg font-semibold transition-colors"
          >
            {myReady ? '준비 완료' : '준비'}
          </button>
        )}
        <button
          onClick={onReset}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-semibold transition-colors"
        >
          리셋
        </button>
      </div>
    </div>
  );
};