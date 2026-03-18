import { useRef, useCallback, useEffect } from 'react';

interface QueueItem {
  action: () => void;
  interactive?: boolean; // true면 resume() 호출 전까지 큐 진행 안 함
  immediate?: boolean;   // true면 앞선 애니메이션과 동시에 실행 (delay 소비 안 함)
}

function executeAction(item: QueueItem): void {
  try {
    item.action();
  } catch (e) {
    console.error('[AnimQ] action threw!', e);
  }
}

/** 현재 아이템 뒤에 연속된 immediate 아이템들을 실행하고 개수를 반환 */
function runConsecutiveImmediates(queue: QueueItem[]): number {
  let count = 0;
  for (let i = 1; i < queue.length; i++) {
    if (!queue[i].immediate) break;
    executeAction(queue[i]);
    count++;
  }
  return count;
}

export const useAnimationQueue = (delay: number = 800) => {
  const queueRef = useRef<QueueItem[]>([]);
  const isProcessingRef = useRef(false);
  const waitingForResumeRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const processNext = useCallback(() => {
    const queue = queueRef.current;
    if (isProcessingRef.current || queue.length === 0) return;

    isProcessingRef.current = true;
    const item = queue[0];

    executeAction(item);

    const immediateCount = runConsecutiveImmediates(queue);
    const totalConsumed = 1 + immediateCount;

    if (item.interactive) {
      waitingForResumeRef.current = true;
      if (immediateCount > 0) {
        queue.splice(1, immediateCount);
      }
    } else if (item.immediate) {
      queue.splice(0, totalConsumed);
      isProcessingRef.current = false;
      processNext();
    } else {
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        isProcessingRef.current = false;
        waitingForResumeRef.current = false;
        queue.splice(0, totalConsumed);
        processNext();
      }, delay);
    }
  }, [delay]);

  const enqueue = useCallback((action: () => void, options?: { interactive?: boolean; immediate?: boolean }) => {
    queueRef.current.push({ action, ...options });
    processNext();
  }, [processNext]);

  const resume = useCallback(() => {
    if (waitingForResumeRef.current) {
      isProcessingRef.current = false;
      waitingForResumeRef.current = false;
      queueRef.current.splice(0, 1);
      processNext();
    }
  }, [processNext]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { enqueue, resume };
};
