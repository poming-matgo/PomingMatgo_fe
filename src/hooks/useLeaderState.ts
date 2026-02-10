import { useState, useCallback } from 'react';
import { Player } from '../types/websocket';
import type { LeaderState } from '../types/game';
import type { LeaderSelectionResultData } from '../types/websocket';

export const useLeaderState = () => {
  const [leaderState, setLeaderState] = useState<LeaderState>({
    selections: [],
    result: null,
  });

  const handleLeaderSelection = useCallback((selectedPlayer: Player, cardIndex: number) => {
    setLeaderState(prev => ({
      ...prev,
      selections: [...prev.selections, { player: selectedPlayer, cardIndex }]
    }));
  }, []);

  const handleLeaderSelectionResult = useCallback((data: LeaderSelectionResultData) => {
    setLeaderState(prev => ({ ...prev, result: data }));
  }, []);

  return {
    leaderState,
    handleLeaderSelection,
    handleLeaderSelectionResult,
  };
};
