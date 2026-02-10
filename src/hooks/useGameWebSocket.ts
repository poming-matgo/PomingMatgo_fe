import { useEffect, useRef, useState, useCallback } from 'react';
import { DEV_CONFIG } from '../config/dev';
import {
  EventMainType,
  EventSubType,
  type WebSocketRequest,
  type WebSocketResponse,
  type JoinRoomData,
  type Player,
  type LeaderSelectionResultData,
  type DistributeCardData,
  type DistributedFloorCardData,
  type AnnounceTurnInformationData,
  type AcquiredCardData,
} from '../types/websocket';

interface UseGameWebSocketProps {
  userId: string;
  roomId: string;
  onOpponentConnect?: (player: Player) => void;
  onPlayerReady?: (player: Player) => void;
  onGameStart?: () => void;
  onLeaderSelection?: (player: Player, cardIndex: number) => void;
  onLeaderSelectionResult?: (data: LeaderSelectionResultData) => void;
  onDistributeCard?: (player: Player, cards: DistributeCardData) => void;
  onDistributedFloorCard?: (data: DistributedFloorCardData) => void;
  onAnnounceTurnInformation?: (data: AnnounceTurnInformationData) => void;
  onSubmitCard?: (player: Player, cardName: string) => void;
  onCardRevealed?: (cardName: string) => void;
  onAcquiredCard?: (player: Player, data: AcquiredCardData) => void;
}

interface UseGameWebSocketReturn {
  isConnected: boolean;
  connectedPlayers: Player[];
  sendMessage: <T>(message: WebSocketRequest<T>) => void;
  sendReady: () => void;
  sendLeaderSelection: (cardIndex: number) => void;
  sendNormalSubmit: (cardIndex: number) => void;
}

export const useGameWebSocket = ({
  userId,
  roomId,
  onOpponentConnect,
  onPlayerReady,
  onGameStart,
  onLeaderSelection,
  onLeaderSelectionResult,
  onDistributeCard,
  onDistributedFloorCard,
  onAnnounceTurnInformation,
  onSubmitCard,
  onCardRevealed,
  onAcquiredCard,
}: UseGameWebSocketProps): UseGameWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState<Player[]>([]);

  const sendMessage = useCallback(<T,>(message: WebSocketRequest<T>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendReady = useCallback(() => {
    const readyMessage = {
      eventType: {
        type: EventMainType.ROOM,
        subType: EventSubType.READY,
      },
    };
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(readyMessage));
    }
  }, []);

  const sendLeaderSelection = useCallback((cardIndex: number) => {
    const message = {
      eventType: {
        type: EventMainType.PREGAME,
        subType: EventSubType.LEADER_SELECTION,
      },
      data: {
        cardIndex: String(cardIndex),
      },
    };
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const sendNormalSubmit = useCallback((cardIndex: number) => {
    const message = {
      eventType: {
        type: EventMainType.GAME,
        subType: EventSubType.NORMAL_SUBMIT,
      },
      data: {
        cardIndex: String(cardIndex),
      },
    };
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(DEV_CONFIG.WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);

      const connectMessage: WebSocketRequest<JoinRoomData> = {
        eventType: {
          type: EventMainType.JOIN_ROOM,
          subType: EventSubType.CONNECT,
        },
        data: {
          userId,
          roomId,
        },
      };
      ws.send(JSON.stringify(connectMessage));
    };

    ws.onmessage = (event) => {
      try {
        const response: WebSocketResponse = JSON.parse(event.data);

        if (response.status === 'CONNECT') {
          setConnectedPlayers((prev) => {
            if (!prev.includes(response.player)) {
              return [...prev, response.player];
            }
            return prev;
          });
          onOpponentConnect?.(response.player);
        }

        if (response.status === 'READY') {
          onPlayerReady?.(response.player);
        }

        if (response.status === 'START') {
          onGameStart?.();
        }

        if (response.status === 'LEADER_SELECTION') {
          onLeaderSelection?.(response.player, response.data as number);
        }

        if (response.status === 'LEADER_SELECTION_RESULT') {
          onLeaderSelectionResult?.(response.data as LeaderSelectionResultData);
        }

        if (response.status === 'DISTRIBUTE_CARD') {
          onDistributeCard?.(response.player, response.data as DistributeCardData);
        }

        if (response.status === 'DISTRIBUTED_FLOOR_CARD') {
          onDistributedFloorCard?.(response.data as DistributedFloorCardData);
        }

        if (response.status === 'ANNOUNCE_TURN_INFORMATION') {
          onAnnounceTurnInformation?.(response.data as AnnounceTurnInformationData);
        }

        if (response.status === 'SUBMIT_CARD') {
          onSubmitCard?.(response.player, response.data as string);
        }

        if (response.status === 'CARD_REVEALED') {
          onCardRevealed?.(response.data as string);
        }

        if (response.status === 'ACQUIRED_CARD') {
          onAcquiredCard?.(response.player, response.data as AcquiredCardData);
        }
      } catch (err) {
        console.error('WS 메시지 파싱 오류:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [userId, roomId, onOpponentConnect, onPlayerReady, onGameStart, onLeaderSelection, onLeaderSelectionResult, onDistributeCard, onDistributedFloorCard, onAnnounceTurnInformation, onSubmitCard, onCardRevealed, onAcquiredCard]);

  return {
    isConnected,
    connectedPlayers,
    sendMessage,
    sendReady,
    sendLeaderSelection,
    sendNormalSubmit,
  };
};
