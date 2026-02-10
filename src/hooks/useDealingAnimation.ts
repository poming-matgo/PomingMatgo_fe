import { useState, useEffect, useMemo } from 'react';

const TOTAL_CARDS = 48;
const CARD_DEAL_INTERVAL = 150;
const PHASE_GAP = 800;
const TURN_DISPLAY_DURATION = 2000;

type DealPhase = 'ready' | 'deal-player' | 'deal-opponent' | 'deal-floor' | 'show-turn' | 'done';

interface UseDealingAnimationProps {
  isDealing: boolean;
  playerHandCount: number;
  opponentHandCount: number;
  fieldCardCount: number;
  onDealingComplete?: () => void;
}

interface UseDealingAnimationReturn {
  phase: DealPhase;
  dealingDone: boolean;
  deckDisplayCount: number;
  visiblePlayerCards: number;
  visibleOpponentCount: number;
  visibleFloorCount: number;
}

export const useDealingAnimation = ({
  isDealing,
  playerHandCount,
  opponentHandCount,
  fieldCardCount,
  onDealingComplete,
}: UseDealingAnimationProps): UseDealingAnimationReturn => {
  const [phase, setPhase] = useState<DealPhase>(isDealing ? 'ready' : 'done');
  const [dealtPlayerCount, setDealtPlayerCount] = useState(isDealing ? 0 : playerHandCount);
  const [dealtOpponentCount, setDealtOpponentCount] = useState(isDealing ? 0 : opponentHandCount);
  const [dealtFloorCount, setDealtFloorCount] = useState(isDealing ? 0 : fieldCardCount);

  const dealingDone = phase === 'done';

  // 덱 잔여 수 계산
  const remainingDeck = TOTAL_CARDS - playerHandCount - opponentHandCount - fieldCardCount;

  const deckDisplayCount = useMemo(() => {
    if (!isDealing || dealingDone) return remainingDeck;
    if (phase === 'ready') return TOTAL_CARDS;
    if (phase === 'deal-player') return TOTAL_CARDS - dealtPlayerCount;
    if (phase === 'deal-opponent') return TOTAL_CARDS - playerHandCount - dealtOpponentCount;
    if (phase === 'deal-floor') return TOTAL_CARDS - playerHandCount - opponentHandCount - dealtFloorCount;
    // show-turn
    return remainingDeck;
  }, [isDealing, dealingDone, phase, dealtPlayerCount, dealtOpponentCount, dealtFloorCount, remainingDeck, playerHandCount, opponentHandCount]);

  // 딜링 애니메이션 타이머
  useEffect(() => {
    if (!isDealing) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: 내 카드 배분
    timers.push(setTimeout(() => setPhase('deal-player'), 500));
    for (let i = 0; i < playerHandCount; i++) {
      timers.push(
        setTimeout(() => setDealtPlayerCount(i + 1), 500 + (i + 1) * CARD_DEAL_INTERVAL)
      );
    }
    const afterPlayer = 500 + playerHandCount * CARD_DEAL_INTERVAL + PHASE_GAP;

    // Phase 2: 상대 카드 배분
    timers.push(setTimeout(() => setPhase('deal-opponent'), afterPlayer));
    for (let i = 0; i < opponentHandCount; i++) {
      timers.push(
        setTimeout(() => setDealtOpponentCount(i + 1), afterPlayer + (i + 1) * CARD_DEAL_INTERVAL)
      );
    }
    const afterOpponent = afterPlayer + opponentHandCount * CARD_DEAL_INTERVAL + PHASE_GAP;

    // Phase 3: 바닥 카드 배분
    timers.push(setTimeout(() => setPhase('deal-floor'), afterOpponent));
    for (let i = 0; i < fieldCardCount; i++) {
      timers.push(
        setTimeout(() => setDealtFloorCount(i + 1), afterOpponent + (i + 1) * CARD_DEAL_INTERVAL)
      );
    }
    const afterFloor = afterOpponent + fieldCardCount * CARD_DEAL_INTERVAL + PHASE_GAP;

    // Phase 4: 턴 표시
    timers.push(setTimeout(() => setPhase('show-turn'), afterFloor));

    // 완료
    timers.push(setTimeout(() => {
      setPhase('done');
      onDealingComplete?.();
    }, afterFloor + TURN_DISPLAY_DURATION));

    return () => timers.forEach(clearTimeout);
  }, [isDealing, playerHandCount, opponentHandCount, fieldCardCount, onDealingComplete]);

  return {
    phase,
    dealingDone,
    deckDisplayCount,
    visiblePlayerCards: dealtPlayerCount,
    visibleOpponentCount: dealtOpponentCount,
    visibleFloorCount: dealtFloorCount,
  };
};
