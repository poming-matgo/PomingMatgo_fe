import { useState, useRef, useEffect, useCallback } from 'react';

interface QueueItem {
  action: () => void;
  interactive?: boolean; // true면 resume() 호출 전까지 큐 진행 안 함
  immediate?: boolean;   // true면 앞선 애니메이션과 동시에 실행 (delay 소비 안 함)
}

export const useAnimationQueue = (delay: number = 800) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const isProcessingRef = useRef(false);
  const waitingForResumeRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const advance = useCallback(() => {
    isProcessingRef.current = false;
    waitingForResumeRef.current = false;
    setQueue(prev => prev.slice(1));
  }, []);

  const enqueue = useCallback((action: () => void, options?: { interactive?: boolean; immediate?: boolean }) => {
    setQueue(prev => [...prev, { action, interactive: options?.interactive, immediate: options?.immediate }]);
  }, []);

  const resume = useCallback(() => {
    if (waitingForResumeRef.current) {
      advance();
    }
  }, [advance]);

  useEffect(() => {
    if (isProcessingRef.current || queue.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const item = queue[0];
    item.action();

    // 뒤따르는 immediate 아이템을 현재 아이템과 동시에 실행
    let extraConsumed = 0;
    for (let i = 1; i < queue.length; i++) {
      if (!queue[i].immediate) break;
      queue[i].action();
      extraConsumed++;
    }
    const totalConsumed = 1 + extraConsumed;

    if (item.interactive) {
      // interactive 항목: resume() 호출될 때까지 대기
      waitingForResumeRef.current = true;
      // immediate 아이템은 이미 실행했으므로 큐에서 제거
      if (extraConsumed > 0) {
        setQueue(prev => [...prev.slice(0, 1), ...prev.slice(totalConsumed)]);
      }
    } else if (item.immediate) {
      // immediate 아이템이 큐 맨 앞에 온 경우: delay 없이 즉시 진행
      isProcessingRef.current = false;
      setQueue(prev => prev.slice(totalConsumed));
    } else {
      // 일반 항목: delay 후 자동 진행 (immediate 포함하여 한꺼번에 제거)
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        isProcessingRef.current = false;
        waitingForResumeRef.current = false;
        setQueue(prev => prev.slice(totalConsumed));
      }, delay);
    }
  }, [queue, delay, advance]);

  // 컴포넌트 언마운트 시에만 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { enqueue, resume };
};
