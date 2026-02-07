interface WaitingScreenProps {
  hasOpponent: boolean;
  myReady: boolean;
  opponentReady: boolean;
}

export const WaitingScreen = ({ hasOpponent, myReady, opponentReady }: WaitingScreenProps) => {
  return (
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
  );
};