import { useState, useRef, useEffect, useCallback } from 'react';

export const useAnimationQueue = (delay: number = 800) => {
  const [queue, setQueue] = useState<Array<() => void>>([]);
  const isProcessingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const enqueue = useCallback((action: () => void) => {
    setQueue(prev => [...prev, action]);
  }, []);

  useEffect(() => {
    if (isProcessingRef.current || queue.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const action = queue[0];
    action();

    timerRef.current = window.setTimeout(() => {
      isProcessingRef.current = false;
      setQueue(prev => prev.slice(1));
      timerRef.current = null;
    }, delay);
  }, [queue, delay]);

  // 컴포넌트 언마운트 시에만 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { enqueue };
};