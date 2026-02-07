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
      console.log('WS 전송:', message);
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
      console.log('WS 전송:', readyMessage);
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
      console.log('WS 전송:', message);
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
      console.log('WS 전송:', message);
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(DEV_CONFIG.WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket 연결됨');
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
      console.log('CONNECT 메시지 전송:', connectMessage);
    };

    ws.onmessage = (event) => {
      try {
        const response: WebSocketResponse = JSON.parse(event.data);
        console.log('WS 수신:', response);

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

        // 게임 진행 메시지
        if (response.status === 'SUBMIT_CARD') {
          console.log('✅ SUBMIT_CARD matched, calling handler');
          onSubmitCard?.(response.player, response.data as string);
        }

        if (response.status === 'CARD_REVEALED') {
          console.log('✅ CARD_REVEALED matched, calling handler');
          onCardRevealed?.(response.data as string);
        }

        if (response.status === 'ACQUIRED_CARD') {
          console.log('✅ ACQUIRED_CARD matched, calling handler');
          onAcquiredCard?.(response.player, response.data as AcquiredCardData);
        }

        // 매칭되지 않은 게임 진행 상태 체크
        const gameStatuses = ['SUBMIT_CARD', 'CARD_REVEALED', 'ACQUIRED_CARD'];
        if (gameStatuses.some(s => response.status.includes(s.split('_').join('').toLowerCase()))) {
          console.warn('❌ Game status received but not matched:', response.status);
        }
      } catch (err) {
        console.error('WS 메시지 파싱 오류:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket 연결 종료');
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
