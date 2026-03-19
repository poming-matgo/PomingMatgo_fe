import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GamePhase, SetupCondition } from '../constants/gamePhase';
import type { LeaderState } from '../types/game';

const SETUP_TRANSITION_DELAY_MS = 3000;
const REQUIRED_SETUP_CONDITIONS = [SetupCondition.HAND, SetupCondition.FLOOR, SetupCondition.TURN];

interface UseGamePhaseProps {
  leaderResult: LeaderState['result'];
}

export const useGamePhase = ({ leaderResult }: UseGamePhaseProps) => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.WAITING);
  const phaseRef = useRef(phase);
  const [setupConditions, setSetupConditions] = useState<Set<string>>(new Set());

  // phase가 변경될 때마다 ref 업데이트
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // 파생 상태: setupConditions가 변경될 때만 재계산
  const isSetupReady = useMemo(
    () => REQUIRED_SETUP_CONDITIONS.every((cond) => setupConditions.has(cond)),
    [setupConditions],
  );

  // Phase Transition Logic (LEADER_SELECTION -> SETUP -> PLAYING)
  useEffect(() => {
    if (phase !== GamePhase.LEADER_SELECTION || !leaderResult || !isSetupReady) return;

    const timerId = window.setTimeout(() => {
      setPhase(GamePhase.SETUP);
    }, SETUP_TRANSITION_DELAY_MS);

    return () => clearTimeout(timerId);
  }, [phase, leaderResult, isSetupReady]);

  const handleDealingComplete = useCallback(() => {
    setPhase(GamePhase.PLAYING);
  }, []);

  const addSetupCondition = useCallback((condition: string) => {
    setSetupConditions(prev => new Set(prev).add(condition));
  }, []);

  return {
    phase,
    phaseRef,
    setPhase,
    setupConditions,
    addSetupCondition,
    handleDealingComplete,
  };
};
