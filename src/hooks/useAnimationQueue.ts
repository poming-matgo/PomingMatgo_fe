import { useState, useRef, useEffect, useCallback } from 'react';

interface QueueItem {
  action: () => void;
  interactive?: boolean; // true면 resume() 호출 전까지 큐 진행 안 함
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

  const enqueue = useCallback((action: () => void, options?: { interactive?: boolean }) => {
    setQueue(prev => [...prev, { action, interactive: options?.interactive }]);
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

    if (item.interactive) {
      // interactive 항목: resume() 호출될 때까지 대기
      waitingForResumeRef.current = true;
    } else {
      // 일반 항목: delay 후 자동 진행
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        advance();
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