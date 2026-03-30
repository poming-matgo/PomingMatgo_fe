import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Card as CardData, CardName } from '../types/card';

interface UseOptimisticSubmitOptions {
  hand: CardData[];
  currentTurn: 'player' | 'opponent';
  turnKey?: number;
  isDealing: boolean;
  dealingDone: boolean;
  visiblePlayerCards: number;
  isTimerExpired?: boolean;
  onCardSubmit?: (cardIndex: number) => void;
}

export const useOptimisticSubmit = ({
  hand,
  currentTurn,
  turnKey,
  isDealing,
  dealingDone,
  visiblePlayerCards,
  isTimerExpired = false,
  onCardSubmit,
}: UseOptimisticSubmitOptions) => {
  // 클릭 즉시 UI에서 카드를 숨기기 위한 낙관적 제거 목록
  const [pendingSubmits, setPendingSubmits] = useState<Set<CardName>>(new Set());
  // ref로 동기적 이중 제출 차단 (React 배칭 우회)
  const submittedRef = useRef(false);

  // player.hand가 실제로 갱신되면 pending 목록에서 이미 제거된 카드를 정리
  useEffect(() => {
    setPendingSubmits((prev) => {
      if (prev.size === 0) return prev;
      const handNames = new Set(hand.map(c => c.name));
      const next = new Set([...prev].filter(name => handNames.has(name)));
      return next.size === prev.size ? prev : next;
    });
  }, [hand]);

  // 새 턴이 시작되면 제출 잠금 해제 (같은 플레이어에게 턴이 돌아오는 경우도 포함)
  useEffect(() => {
    submittedRef.current = false;
  }, [currentTurn, turnKey]);

  const visibleHand = useMemo(() => {
    const base = isDealing && !dealingDone
      ? hand.slice(0, visiblePlayerCards)
      : hand;

    if (pendingSubmits.size === 0) return base;
    return base.filter(c => !pendingSubmits.has(c.name));
  }, [isDealing, dealingDone, hand, visiblePlayerCards, pendingSubmits]);

  const canSubmit = !isDealing && currentTurn === 'player' && !isTimerExpired;

  const handleCardClick = useCallback((cardName: CardName) => {
    if (!onCardSubmit) return;
    if (isDealing || currentTurn !== 'player') return;
    if (isTimerExpired) return; // 제출 시간 초과
    if (submittedRef.current) return; // 턴당 한 장만 (동기적 차단)

    const index = hand.findIndex(c => c.name === cardName);
    if (index === -1) return;

    submittedRef.current = true;
    setPendingSubmits((prev) => new Set(prev).add(cardName));
    onCardSubmit(index);
  }, [onCardSubmit, isDealing, currentTurn, isTimerExpired, hand]);

  return { visibleHand, canSubmit, handleCardClick };
};
