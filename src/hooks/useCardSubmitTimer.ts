import { useEffect, useRef, useState } from 'react';

const SUBMIT_TIMEOUT_SEC = 10;

interface UseCardSubmitTimerOptions {
  currentTurn: 'player' | 'opponent';
  turnKey?: number;
  isDealing: boolean;
  dealingDone: boolean;
}

export const useCardSubmitTimer = ({
  currentTurn,
  turnKey,
  isDealing,
  dealingDone,
}: UseCardSubmitTimerOptions) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    // 딜링 중이거나 상대 턴이면 타이머 비활성
    if (currentTurn !== 'player' || isDealing || !dealingDone) {
      clearTimer();
      setTimeLeft(null);
      return;
    }

    setTimeLeft(SUBMIT_TIMEOUT_SEC);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, turnKey, isDealing, dealingDone]);

  return {
    timeLeft,
    isExpired: timeLeft === 0,
  };
};
