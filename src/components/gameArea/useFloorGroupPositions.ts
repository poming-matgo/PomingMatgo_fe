import { useEffect, useMemo, useRef, useState } from 'react';
import type { Card } from '../../types/card';
import {
  getSortedGroups,
  computeGroupPositions,
  type MonthGroup,
  type CachedGroup,
} from './floorLayout';

/**
 * 바닥 카드의 월별 그룹과 위치를 관리하는 Custom Hook.
 *
 * - useMemo 내부에서 ref를 mutate하지 않음
 * - 캐시 갱신은 useEffect에서 수행 (Concurrent Mode safe)
 */
export function useFloorGroupPositions(cards: Card[]) {
  const cacheRef = useRef<Map<string, CachedGroup>>(new Map());
  const [cache, setCache] = useState<ReadonlyMap<string, CachedGroup>>(() => new Map());

  const sortedGroups: MonthGroup[] = useMemo(() => getSortedGroups(cards), [cards]);

  const { positions, nextCache } = useMemo(
    () => computeGroupPositions(sortedGroups, cache),
    [sortedGroups, cache],
  );

  // 캐시 동기화: 렌더링 이후 안전하게 ref/state 갱신
  useEffect(() => {
    const prev = cacheRef.current;

    // 변경이 있을 때만 업데이트
    if (prev.size !== nextCache.size || [...nextCache].some(([k, v]) => prev.get(k) !== v)) {
      cacheRef.current = nextCache;
      setCache(nextCache);
    }
  }, [nextCache]);

  return { sortedGroups, positions };
}
