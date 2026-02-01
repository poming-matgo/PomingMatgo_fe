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
}

interface UseGameWebSocketReturn {
  isConnected: boolean;
  connectedPlayers: Player[];
  sendMessage: <T>(message: WebSocketRequest<T>) => void;
}

export const useGameWebSocket = ({
  userId,
  roomId,
  onOpponentConnect,
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
  }, [userId, roomId, onOpponentConnect]);

  return {
    isConnected,
    connectedPlayers,
    sendMessage,
  };
};
