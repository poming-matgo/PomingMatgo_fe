import { useEffect, useRef, useState, useCallback } from 'react';
import { DEV_CONFIG } from '../config/dev';
import {
  EventMainType,
  EventSubType,
  type WebSocketRequest,
  type WebSocketResponse,
  type JoinRoomData,
  type Player,
} from '../types/websocket';

interface UseGameWebSocketProps {
  userId: string;
  roomId: string;
  onOpponentConnect?: (player: Player) => void;
  onPlayerReady?: (player: Player) => void;
  onGameStart?: () => void;
}

interface UseGameWebSocketReturn {
  isConnected: boolean;
  connectedPlayers: Player[];
  sendMessage: <T>(message: WebSocketRequest<T>) => void;
  sendReady: () => void;
}

export const useGameWebSocket = ({
  userId,
  roomId,
  onOpponentConnect,
  onPlayerReady,
  onGameStart,
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

  useEffect(() => {
    const ws = new WebSocket(DEV_CONFIG.WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket 연결됨');
      setIsConnected(true);

      // 연결 즉시 JOIN_ROOM/CONNECT 메시지 전송
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

        // CONNECT 상태 메시지 처리
        if (response.status === 'CONNECT') {
          setConnectedPlayers((prev) => {
            if (!prev.includes(response.player)) {
              return [...prev, response.player];
            }
            return prev;
          });
          onOpponentConnect?.(response.player);
        }

        // READY 상태 메시지 처리
        if (response.status === 'READY') {
          onPlayerReady?.(response.player);
        }

        // START 상태 메시지 처리 (둘 다 준비 완료)
        if (response.status === 'START') {
          onGameStart?.();
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
  }, [userId, roomId, onOpponentConnect, onPlayerReady, onGameStart]);

  return {
    isConnected,
    connectedPlayers,
    sendMessage,
    sendReady,
  };
};
