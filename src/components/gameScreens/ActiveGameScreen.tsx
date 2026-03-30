import { useCallback, useMemo } from 'react';
import { LayoutGroup } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useDealingAnimation } from '../../hooks/useDealingAnimation';
import { useOptimisticSubmit } from '../../hooks/useOptimisticSubmit';
import { useCardSubmitTimer } from '../../hooks/useCardSubmitTimer';
import { HandArea } from '../gameArea/HandArea';
import { FloorCardsArea } from '../gameArea/FloorCardsArea';
import { TurnOverlay } from '../gameArea/TurnOverlay';
import { CapturedArea } from '../CapturedArea';
import { ScoreHUD } from './ScoreHUD';
import { OpponentWaitingOverlay, GoResultBanner, GoStopChoiceModal } from './GameOverlays';

interface ActiveGameScreenProps {
  isDealing?: boolean;
  onCardSubmit?: (cardIndex: number) => void;
  onDealingComplete?: () => void;
  sendFloorSelect?: (cardIndex: number) => void;
  sendGoStopChoice?: (go: boolean) => void;
  resume?: () => void;
}

export const ActiveGameScreen = ({
  isDealing = false,
  onCardSubmit,
  onDealingComplete,
  sendFloorSelect,
  sendGoStopChoice,
  resume,
}: ActiveGameScreenProps) => {
  // --- Store 직접 구독 ---
  const player = useGameStore(state => state.player);
  const opponent = useGameStore(state => state.opponent);
  const field = useGameStore(state => state.field);
  const currentTurn = useGameStore(state => state.currentTurn);
  const turnKey = useGameStore(state => state.turnKey);
  const floorCardChoices = useGameStore(state => state.floorCardChoices);
  const goStopChoiceCount = useGameStore(state => state.goStopChoiceCount);
  const opponentGoStopWaiting = useGameStore(state => state.opponentGoStopWaiting);
  const goResultBanner = useGameStore(state => state.goResultBanner);
  const playerGoCount = useGameStore(state => state.playerGoCount);
  const opponentGoCount = useGameStore(state => state.opponentGoCount);
  const setFloorCardChoices = useGameStore(state => state.setFloorCardChoices);
  const setGoStopChoiceCount = useGameStore(state => state.setGoStopChoiceCount);

  const handleFloorCardSelect = useCallback((cardIndex: number) => {
    sendFloorSelect?.(cardIndex);
    setFloorCardChoices(null);
    resume?.();
  }, [sendFloorSelect, setFloorCardChoices, resume]);

  const handleGoStopSelect = useCallback((go: boolean) => {
    sendGoStopChoice?.(go);
    setGoStopChoiceCount(null);
    resume?.();
  }, [sendGoStopChoice, setGoStopChoiceCount, resume]);
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

  const { timeLeft, isExpired: isTimerExpired } = useCardSubmitTimer({
    currentTurn,
    turnKey,
    isDealing,
    dealingDone,
  });

  const { visibleHand, canSubmit, handleCardClick } = useOptimisticSubmit({
    hand: player.hand,
    currentTurn,
    turnKey,
    isDealing,
    dealingDone,
    visiblePlayerCards,
    isTimerExpired,
    onCardSubmit,
  });

  const visibleOpponentHand = useMemo(
    () => (isDealing && !dealingDone ? opponent.hand.slice(0, visibleOpponentCount) : opponent.hand),
    [isDealing, dealingDone, opponent.hand, visibleOpponentCount]
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
          <div className="w-[420px] shrink-0">
            <CapturedArea captured={opponent.captured} />
          </div>
          <div className="flex-1 flex justify-center">
            <HandArea
              cards={visibleOpponentHand}
              isOpponent={true}
              isDealing={isDealing}
              dealingDone={dealingDone}
              currentTurn={currentTurn}
            />
          </div>
          <div className="shrink-0">
            <ScoreHUD
              isOpponent
              score={opponent.score}
              isTurn={currentTurn === 'opponent'}
              goCount={opponentGoCount}
            />
          </div>
        </div>

        {/* ===== 중앙 영역: 바닥패 + 덱 ===== */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <FloorCardsArea
            cards={visibleFloorCards}
            isDealing={isDealing}
            dealingDone={dealingDone}
            deckCount={deckDisplayCount}
            deckSampleCard={field[0] ?? player.hand[0]}
            floorCardChoices={floorCardChoices}
            onFloorCardSelect={handleFloorCardSelect}
          />
        </div>

        {/* ===== 하단 영역: 나 ===== */}
        <div className="flex items-center gap-3 px-3 py-2 bg-black/10 rounded-b-lg shadow-[0_-2px_8px_rgba(0,0,0,0.15)] relative">
          {timeLeft !== null && (
            <div className={`absolute top-1 right-2 text-xs font-bold px-2 py-0.5 rounded ${timeLeft <= 3 ? 'text-red-400' : 'text-yellow-300'}`}>
              {timeLeft === 0 ? '시간 초과' : `${timeLeft}초`}
            </div>
          )}
          <div className="w-[420px] shrink-0">
            <CapturedArea captured={player.captured} />
          </div>
          <div className="flex-1 flex justify-center">
            <HandArea
              cards={visibleHand}
              isOpponent={false}
              isDealing={isDealing}
              dealingDone={dealingDone}
              currentTurn={currentTurn}
              onCardClick={canSubmit ? handleCardClick : undefined}
            />
          </div>
          <div className="shrink-0">
            <ScoreHUD
              isOpponent={false}
              score={player.score}
              isTurn={currentTurn === 'player'}
              goCount={playerGoCount}
            />
          </div>
        </div>

        {/* 오버레이 & 모달 */}
        <OpponentWaitingOverlay visible={opponentGoStopWaiting} />
        <GoResultBanner text={goResultBanner} />
        <GoStopChoiceModal choiceCount={goStopChoiceCount} onSelect={handleGoStopSelect} />
        <TurnOverlay phase={phase} currentTurn={currentTurn} />
      </div>
    </LayoutGroup>
  );
};
