interface TurnIndicatorProps {
  currentTurn: 'player' | 'opponent';
}

export const TurnIndicator = ({ currentTurn }: TurnIndicatorProps) => {
  return (
    <div className="text-center">
      <div className="inline-block px-4 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full">
        {currentTurn === 'player' ? '내 차례' : '상대방 차례'}
      </div>
    </div>
  );
};
