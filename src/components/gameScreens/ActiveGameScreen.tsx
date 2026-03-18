import { useMemo } from 'react';
import { LayoutGroup } from 'framer-motion';
import { useDealingAnimation } from '../../hooks/useDealingAnimation';
import { useOptimisticSubmit } from '../../hooks/useOptimisticSubmit';
import { HandArea } from '../gameArea/HandArea';
import { FloorCardsArea } from '../gameArea/FloorCardsArea';
import { TurnOverlay } from '../gameArea/TurnOverlay';
import { CapturedArea } from '../CapturedArea';
import { ScoreHUD } from './ScoreHUD';
import { OpponentWaitingOverlay, GoResultBanner, GoStopChoiceModal } from './GameOverlays';
import type { Player } from '../../types/game';
import type { Card as CardData } from '../../types/card';

interface ActiveGameScreenProps {
  player: Player;
  opponent: Player;
  field: CardData[];
  currentTurn: 'player' | 'opponent';
  turnKey?: number;
  isDealing?: boolean;
  onCardSubmit?: (cardIndex: number) => void;
  onDealingComplete?: () => void;
  floorCardChoices?: string[] | null;
  onFloorCardSelect?: (cardIndex: number) => void;
  goStopChoiceCount?: number | null;
  onGoStopSelect?: (go: boolean) => void;
  opponentGoStopWaiting?: boolean;
  goResultBanner?: string | null;
  playerGoCount?: number;
  opponentGoCount?: number;
}

export const ActiveGameScreen = ({
  player,
  opponent,
  field,
  currentTurn,
  isDealing = false,
  onCardSubmit,
  onDealingComplete,
  floorCardChoices,
  onFloorCardSelect,
  goStopChoiceCount,
  onGoStopSelect,
  turnKey,
  opponentGoStopWaiting = false,
  goResultBanner,
  playerGoCount = 0,
  opponentGoCount = 0,
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

  const { visibleHand, canSubmit, handleCardClick } = useOptimisticSubmit({
    hand: player.hand,
    currentTurn,
    turnKey,
    isDealing,
    dealingDone,
    visiblePlayerCards,
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
            onFloorCardSelect={onFloorCardSelect}
          />
        </div>

        {/* ===== 하단 영역: 나 ===== */}
        <div className="flex items-center gap-3 px-3 py-2 bg-black/10 rounded-b-lg shadow-[0_-2px_8px_rgba(0,0,0,0.15)]">
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
        <GoStopChoiceModal choiceCount={goStopChoiceCount} onSelect={onGoStopSelect} />
        <TurnOverlay phase={phase} currentTurn={currentTurn} />
      </div>
    </LayoutGroup>
  );
};
