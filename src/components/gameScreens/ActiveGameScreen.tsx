import { useMemo } from 'react';
import { LayoutGroup } from 'framer-motion';
import { useDealingAnimation } from '../../hooks/useDealingAnimation';
import { TurnIndicator } from '../gameArea/TurnIndicator';
import { HandArea } from '../gameArea/HandArea';
import { DeckDisplay } from '../gameArea/DeckDisplay';
import { FloorCardsArea } from '../gameArea/FloorCardsArea';
import { TurnOverlay } from '../gameArea/TurnOverlay';
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

export const ActiveGameScreen = ({
  player,
  opponent,
  field,
  currentTurn,
  isDealing = false,
  onCardSubmit,
  onDealingComplete,
}: ActiveGameScreenProps) => {
  // Custom hook으로 애니메이션 상태 관리
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

  // useMemo로 최적화된 데이터
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
      <div className="flex-1 flex flex-col gap-1 relative">
        {/* 현재 턴 표시 (딜링 끝난 후) */}
        {dealingDone && <TurnIndicator currentTurn={currentTurn} />}

        {/* 상대방 영역 */}
        <HandArea
          player={opponent}
          isOpponent={true}
          visibleCards={visibleOpponentCount}
          isDealing={isDealing}
          dealingDone={dealingDone}
          currentTurn={currentTurn}
        />

        {/* 중앙: 바닥 패 + 덱 */}
        <div className="flex items-center justify-center gap-6 py-2 flex-shrink-0">
          <DeckDisplay
            count={deckDisplayCount}
            sampleCard={field[0] ?? player.hand[0]}
            isDealing={isDealing}
            dealingDone={dealingDone}
          />
          <FloorCardsArea
            cards={visibleFloorCards}
            isDealing={isDealing}
            dealingDone={dealingDone}
          />
        </div>

        {/* 플레이어 영역 */}
        <HandArea
          player={player}
          isOpponent={false}
          visibleCards={visiblePlayerHand}
          isDealing={isDealing}
          dealingDone={dealingDone}
          currentTurn={currentTurn}
          onCardClick={onCardSubmit}
        />

        {/* 턴 안내 오버레이 (딜링 후) */}
        <TurnOverlay phase={phase} currentTurn={currentTurn} />
      </div>
    </LayoutGroup>
  );
};