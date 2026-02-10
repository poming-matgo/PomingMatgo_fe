import { useMemo } from 'react';
import { LayoutGroup } from 'framer-motion';
import { useDealingAnimation } from '../../hooks/useDealingAnimation';
import { HandArea } from '../gameArea/HandArea';
import { FloorCardsArea } from '../gameArea/FloorCardsArea';
import { TurnOverlay } from '../gameArea/TurnOverlay';
import { CapturedArea } from '../CapturedArea';
import type { Player } from '../../types/game';
import type { Card as CardData } from '../../types/card';

interface ActiveGameScreenProps {
  player: Player;
  opponent: Player;
  field: CardData[];
  currentTurn: 'player' | 'opponent';
  isDealing?: boolean;
  onCardSubmit?: (cardIndex: number) => void;
  onDealingComplete?: () => void;
}

/** 반투명 검정 라운드 박스 HUD */
const ScoreHUD = ({
  label,
  score,
  isTurn,
  accentColor,
}: {
  label: string;
  score: number;
  isTurn: boolean;
  accentColor: string;
}) => (
  <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg border border-white/10 min-w-[140px]">
    <div className={`w-9 h-9 rounded-full ${accentColor} flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0`}>
      {label}
    </div>
    <div className="flex flex-col">
      <div className="text-white/70 text-[10px]">{label === '나' ? '나' : '상대방'}</div>
      <div className="text-yellow-400 font-bold text-xl leading-tight">{score}<span className="text-sm">점</span></div>
    </div>
    {isTurn && (
      <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse ml-auto">
        MY TURN
      </span>
    )}
  </div>
);

export const ActiveGameScreen = ({
  player,
  opponent,
  field,
  currentTurn,
  isDealing = false,
  onCardSubmit,
  onDealingComplete,
}: ActiveGameScreenProps) => {
  const {
    phase,
    dealingDone,
    deckDisplayCount,
    visiblePlayerCards,
    visibleOpponentCount,
    visibleFloorCount,
  } = useDealingAnimation({
    isDealing,
    playerHandCount: player.hand.length,
    opponentHandCount: opponent.hand.length,
    fieldCardCount: field.length,
    onDealingComplete,
  });

  const visiblePlayerHand = useMemo(
    () => (isDealing && !dealingDone ? player.hand.slice(0, visiblePlayerCards) : player.hand),
    [isDealing, dealingDone, player.hand, visiblePlayerCards]
  );

  const visibleFloorCards = useMemo(
    () => (isDealing && !dealingDone ? field.slice(0, visibleFloorCount) : field),
    [isDealing, dealingDone, field, visibleFloorCount]
  );

  return (
    <LayoutGroup>
      <div className="flex-1 flex flex-col relative w-full h-full gap-0">

        {/* ===== 상단 영역: 상대방 ===== */}
        <div className="flex items-center gap-3 px-3 py-2 bg-black/10 rounded-t-lg shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          {/* 획득패 슬롯 */}
          <div className="w-[320px] shrink-0">
            <CapturedArea captured={opponent.captured} />
          </div>
          {/* 손패 5×2 */}
          <div className="flex-1 flex justify-center">
            <HandArea
              player={opponent}
              isOpponent={true}
              visibleCards={isDealing && !dealingDone ? visibleOpponentCount : opponent.hand.length}
              isDealing={isDealing}
              dealingDone={dealingDone}
              currentTurn={currentTurn}
            />
          </div>
          {/* Scoreboard HUD */}
          <div className="shrink-0">
            <ScoreHUD
              label="상"
              score={opponent.score}
              isTurn={currentTurn === 'opponent'}
              accentColor="bg-red-600"
            />
          </div>
        </div>

        {/* ===== 중앙 영역: 바닥패 + 덱 ===== */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* 미세한 상하 구분 그림자 */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <FloorCardsArea
            cards={visibleFloorCards}
            isDealing={isDealing}
            dealingDone={dealingDone}
            deckCount={deckDisplayCount}
            deckSampleCard={field[0] ?? player.hand[0]}
          />
        </div>

        {/* ===== 하단 영역: 나 ===== */}
        <div className="flex items-center gap-3 px-3 py-2 bg-black/10 rounded-b-lg shadow-[0_-2px_8px_rgba(0,0,0,0.15)]">
          {/* 획득패 슬롯 */}
          <div className="w-[320px] shrink-0">
            <CapturedArea captured={player.captured} />
          </div>
          {/* 손패 5×2 */}
          <div className="flex-1 flex justify-center">
            <HandArea
              player={player}
              isOpponent={false}
              visibleCards={visiblePlayerHand}
              isDealing={isDealing}
              dealingDone={dealingDone}
              currentTurn={currentTurn}
              onCardClick={onCardSubmit}
            />
          </div>
          {/* Scoreboard HUD */}
          <div className="shrink-0">
            <ScoreHUD
              label="나"
              score={player.score}
              isTurn={currentTurn === 'player'}
              accentColor="bg-blue-600"
            />
          </div>
        </div>

        {/* 턴 안내 오버레이 */}
        <TurnOverlay phase={phase} currentTurn={currentTurn} />
      </div>
    </LayoutGroup>
  );
};
