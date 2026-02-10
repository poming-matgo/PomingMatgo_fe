import { useState, useCallback } from 'react';
import { Player } from '../types/websocket';
import type { ConnectionState } from '../types/game';

interface UseConnectionStateProps {
  initialHasOpponent: boolean;
  myPlayer: Player;
}

export const useConnectionState = ({ initialHasOpponent, myPlayer }: UseConnectionStateProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    hasOpponent: initialHasOpponent,
    myReady: false,
    opponentReady: false,
  });

  const handleOpponentConnect = useCallback((connectedPlayer: Player) => {
    if (connectedPlayer !== myPlayer) {
      setConnectionState(prev => ({ ...prev, hasOpponent: true }));
    }
  }, [myPlayer]);

  const handlePlayerReady = useCallback((readyPlayer: Player) => {
    setConnectionState(prev => ({
      ...prev,
      myReady: readyPlayer === myPlayer ? true : prev.myReady,
      opponentReady: readyPlayer !== myPlayer ? true : prev.opponentReady,
    }));
  }, [myPlayer]);

  return {
    connectionState,
    handleOpponentConnect,
    handlePlayerReady,
  };
};
