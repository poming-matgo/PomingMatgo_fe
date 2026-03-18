/** 반투명 검정 라운드 박스 HUD */
export const ScoreHUD = ({
  isOpponent,
  score,
  isTurn,
  goCount,
}: {
  isOpponent: boolean;
  score: number;
  isTurn: boolean;
  goCount: number;
}) => {
  const label = isOpponent ? '상' : '나';
  const subtitle = isOpponent ? '상대방' : '나';
  const accentColor = isOpponent ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg border border-white/10 w-[220px]">
      <div className={`w-9 h-9 rounded-full ${accentColor} flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0`}>
        {label}
      </div>
      <div className="flex flex-col">
        <div className="text-white/70 text-[10px] whitespace-nowrap">{subtitle}</div>
        <div className="text-yellow-400 font-bold text-xl leading-tight">{score}<span className="text-sm">점</span></div>
      </div>
      <div className="flex flex-col items-end ml-auto gap-1">
        {goCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {goCount}고
          </span>
        )}
        {isTurn && (
          <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            MY TURN
          </span>
        )}
      </div>
    </div>
  );
};
