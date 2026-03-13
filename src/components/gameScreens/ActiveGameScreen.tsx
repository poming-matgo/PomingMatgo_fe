import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useDealingAnimation } from '../../hooks/useDealingAnimation';
import { HandArea } from '../gameArea/HandArea';
import { FloorCardsArea } from '../gameArea/FloorCardsArea';
import { TurnOverlay } from '../gameArea/TurnOverlay';
import { CapturedArea } from '../CapturedArea';
import type { Player } from '../../types/game';
import type { Card as CardData, CardName } from '../../types/card';

interface ActiveGameScreenProps {
  player: Player;
  opponent: Player;
  field: CardData[];
  currentTurn: 'player' | 'opponent';
  isDealing?: boolean;
  onCardSubmit?: (cardIndex: number) => void;
  onDealingComplete?: () => void;
  floorCardChoices?: string[] | null;
  onFloorCardSelect?: (cardIndex: number) => void;
  goStopChoiceCount?: number | null;
  onGoStopSelect?: (go: boolean) => void;
}

/** 반투명 검정 라운드 박스 HUD */
const ScoreHUD = ({
  isOpponent,
  score,
  isTurn,
}: {
  isOpponent: boolean;
  score: number;
  isTurn: boolean;
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
      {isTurn && (
        <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse ml-auto">
          MY TURN
        </span>
      )}
    </div>
  );
};

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

  // 클릭 즉시 UI에서 카드를 숨기기 위한 낙관적 제거 목록
  const [pendingSubmits, setPendingSubmits] = useState<Set<CardName>>(new Set());
  // ref로 동기적 이중 제출 차단 (React 배칭 우회)
  const submittedRef = useRef(false);

  // player.hand가 실제로 갱신되면 pending 목록에서 이미 제거된 카드를 정리
  useEffect(() => {
    setPendingSubmits((prev) => {
      if (prev.size === 0) return prev;
      const handNames = new Set(player.hand.map(c => c.name));
      const next = new Set<CardName>();
      for (const name of prev) {
        if (handNames.has(name)) next.add(name);
      }
      return next.size === prev.size ? prev : next;
    });
  }, [player.hand]);

  // 턴이 바뀌면 제출 잠금 해제
  useEffect(() => {
    submittedRef.current = false;
  }, [currentTurn]);

  const visiblePlayerHand = useMemo(
    () => {
      const hand = isDealing && !dealingDone ? player.hand.slice(0, visiblePlayerCards) : player.hand;
      return pendingSubmits.size > 0 ? hand.filter(c => !pendingSubmits.has(c.name)) : hand;
    },
    [isDealing, dealingDone, player.hand, visiblePlayerCards, pendingSubmits]
  );

  const visibleOpponentHand = useMemo(
    () => (isDealing && !dealingDone ? opponent.hand.slice(0, visibleOpponentCount) : opponent.hand),
    [isDealing, dealingDone, opponent.hand, visibleOpponentCount]
  );

  const visibleFloorCards = useMemo(
    () => (isDealing && !dealingDone ? field.slice(0, visibleFloorCount) : field),
    [isDealing, dealingDone, field, visibleFloorCount]
  );

  const canSubmit = !isDealing && currentTurn === 'player';

  const handleCardClick = useCallback((cardName: string) => {
    if (!onCardSubmit || !canSubmit) return;
    if (submittedRef.current) return; // 턴당 한 장만 (동기적 차단)
    const index = player.hand.findIndex(c => c.name === cardName);
    if (index !== -1) {
      submittedRef.current = true;
      setPendingSubmits((prev) => new Set(prev).add(cardName as CardName));
      onCardSubmit(index);
    }
  }, [onCardSubmit, canSubmit, player.hand]);

  return (
    <LayoutGroup>
      <div className="flex-1 flex flex-col relative w-full h-full gap-0">

        {/* ===== 상단 영역: 상대방 ===== */}
        <div className="flex items-center gap-3 px-3 py-2 bg-black/10 rounded-t-lg shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          {/* 획득패 슬롯 */}
          <div className="w-[420px] shrink-0">
            <CapturedArea captured={opponent.captured} />
          </div>
          {/* 손패 5×2 */}
          <div className="flex-1 flex justify-center">
            <HandArea
              cards={visibleOpponentHand}
              isOpponent={true}
              isDealing={isDealing}
              dealingDone={dealingDone}
              currentTurn={currentTurn}
            />
          </div>
          {/* Scoreboard HUD */}
          <div className="shrink-0">
            <ScoreHUD
              isOpponent
              score={opponent.score}
              isTurn={currentTurn === 'opponent'}
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
            floorCardChoices={floorCardChoices}
            onFloorCardSelect={onFloorCardSelect}
          />
        </div>

        {/* ===== 하단 영역: 나 ===== */}
        <div className="flex items-center gap-3 px-3 py-2 bg-black/10 rounded-b-lg shadow-[0_-2px_8px_rgba(0,0,0,0.15)]">
          {/* 획득패 슬롯 */}
          <div className="w-[420px] shrink-0">
            <CapturedArea captured={player.captured} />
          </div>
          {/* 손패 5×2 */}
          <div className="flex-1 flex justify-center">
            <HandArea
              cards={visiblePlayerHand}
              isOpponent={false}
              isDealing={isDealing}
              dealingDone={dealingDone}
              currentTurn={currentTurn}
              onCardClick={canSubmit ? handleCardClick : undefined}
            />
          </div>
          {/* Scoreboard HUD */}
          <div className="shrink-0">
            <ScoreHUD
              isOpponent={false}
              score={player.score}
              isTurn={currentTurn === 'player'}
            />
          </div>
        </div>

        {/* 고/스톱 선택 모달 */}
        <AnimatePresence>
          {goStopChoiceCount != null && (
            <motion.div
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center gap-6 border border-white/20 shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                <h2 className="text-white text-2xl font-bold">고 / 스톱</h2>
                <p className="text-white/70 text-sm">계속 진행하시겠습니까?</p>
                <div className="flex gap-6">
                  <button
                    onClick={() => onGoStopSelect?.(true)}
                    className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white text-xl font-bold rounded-xl transition-colors shadow-lg hover:shadow-red-500/30 active:scale-95"
                  >
                    {goStopChoiceCount}고
                  </button>
                  <button
                    onClick={() => onGoStopSelect?.(false)}
                    className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-xl transition-colors shadow-lg hover:shadow-blue-500/30 active:scale-95"
                  >
                    스톱
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 턴 안내 오버레이 */}
        <TurnOverlay phase={phase} currentTurn={currentTurn} />
      </div>
    </LayoutGroup>
  );
};
