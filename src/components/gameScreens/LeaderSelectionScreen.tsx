import { Player } from '../../types/websocket';
import type { LeaderSelectionResultData } from '../../types/websocket';

interface CardSelection {
  player: Player;
  cardIndex: number;
}

interface LeaderSelectionScreenProps {
  myPlayer: Player;
  cardSelections: CardSelection[];
  selectionResult: LeaderSelectionResultData | null;
  onSelectCard: (index: number) => void;
}

export const LeaderSelectionScreen = ({
  myPlayer,
  cardSelections,
  selectionResult,
  onSelectCard,
}: LeaderSelectionScreenProps) => {
  
  // 선택 단계 렌더링
  const renderSelection = () => {
    const mySelection = cardSelections.find((s) => s.player === myPlayer);
    const opponentSelection = cardSelections.find((s) => s.player !== myPlayer);

    return (
      <>
        <p className="text-white text-2xl font-bold mb-4">선공을 정합니다</p>

        {/* 상대방 선택 영역 */}
        <div className="mb-8">
          <p className="text-gray-400 text-center mb-2">상대방</p>
          <div
            className={`w-16 h-24 rounded-lg flex items-center justify-center mx-auto transition-all duration-300
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
                onClick={() => canSelect && onSelectCard(index)}
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
          <div
            className={`w-16 h-24 rounded-lg flex items-center justify-center mx-auto transition-all duration-300
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
  };

  // 결과 단계 렌더링
  const renderResult = () => {
    if (!selectionResult) return null;

    const myMonth = myPlayer === Player.PLAYER_1 ? selectionResult.player1Month : selectionResult.player2Month;
    const opponentMonth = myPlayer === Player.PLAYER_1 ? selectionResult.player2Month : selectionResult.player1Month;
    const myCardIndex = cardSelections.find((s) => s.player === myPlayer)?.cardIndex;
    const opponentCardIndex = cardSelections.find((s) => s.player !== myPlayer)?.cardIndex;
    const myCardName = myCardIndex !== undefined ? selectionResult.fiveCards[myCardIndex] : '';
    const opponentCardName = opponentCardIndex !== undefined ? selectionResult.fiveCards[opponentCardIndex] : '';
    
    // 리더 플레이어 ID (1 or 2)와 내 플레이어 타입 비교
    const leadPlayerId = selectionResult.leadPlayer; // 1 or 2
    const myPlayerId = myPlayer === Player.PLAYER_1 ? 1 : 2;
    const isMyLead = leadPlayerId === myPlayerId;

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
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {selectionResult ? renderResult() : renderSelection()}
    </div>
  );
};