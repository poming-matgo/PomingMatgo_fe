import { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, SetupCondition } from '../constants/gamePhase';
import type { LeaderState } from '../types/game';

interface UseGamePhaseProps {
  leaderResult: LeaderState['result'];
}

export const useGamePhase = ({ leaderResult }: UseGamePhaseProps) => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.WAITING);
  const phaseRef = useRef(phase);
  const [setupConditions, setSetupConditions] = useState<Set<string>>(new Set());
  const setupTimerRef = useRef<number | null>(null);

  // phase가 변경될 때마다 ref 업데이트
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Phase Transition Logic (LEADER_SELECTION -> SETUP -> PLAYING)
  useEffect(() => {
    if (phase === GamePhase.LEADER_SELECTION && leaderResult) {
      const requiredConditions = [SetupCondition.HAND, SetupCondition.FLOOR, SetupCondition.TURN];
      const isReady = requiredConditions.every((cond) => setupConditions.has(cond));

      if (isReady && !setupTimerRef.current) {
        setupTimerRef.current = window.setTimeout(() => {
          setPhase(GamePhase.SETUP);
          setupTimerRef.current = null;
        }, 3000);
      }
    }

    return () => {
      if (setupTimerRef.current && phase !== GamePhase.LEADER_SELECTION) {
        clearTimeout(setupTimerRef.current);
        setupTimerRef.current = null;
      }
    };
  }, [phase, setupConditions, leaderResult]);

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
