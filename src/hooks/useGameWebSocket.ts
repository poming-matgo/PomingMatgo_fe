import { useEffect, useRef, useState, useCallback } from 'react';
import { DEV_CONFIG } from '../config/dev';
import {
  EventMainType,
  EventSubType,
  ResponseStatus,
  type WebSocketRequest,
  type WebSocketResponseUnion,
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

export const useGameWebSocket = (props: UseGameWebSocketProps): UseGameWebSocketReturn => {
  const { userId, roomId } = props;
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState<Player[]>([]);

  // 1. 최신 핸들러를 유지하기 위한 Ref
  const callbacksRef = useRef(props);

  useEffect(() => {
    callbacksRef.current = props;
  });

  // 2. 메시지 전송 공통 로직 추출
  const send = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // 3. 편의성 함수들
  const sendRequest = useCallback(<T,>(message: WebSocketRequest<T>) => {
    send(message);
  }, [send]);

  const sendReady = useCallback(() => {
    send({
      eventType: { type: EventMainType.ROOM, subType: EventSubType.READY },
    });
  }, [send]);

  const sendLeaderSelection = useCallback((cardIndex: number) => {
    send({
      eventType: { type: EventMainType.PREGAME, subType: EventSubType.LEADER_SELECTION },
      data: { cardIndex: String(cardIndex) },
    });
  }, [send]);

  const sendNormalSubmit = useCallback((cardIndex: number) => {
    send({
      eventType: { type: EventMainType.GAME, subType: EventSubType.NORMAL_SUBMIT },
      data: { cardIndex: String(cardIndex) },
    });
  }, [send]);

  useEffect(() => {
    const ws = new WebSocket(DEV_CONFIG.WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      const connectMessage: WebSocketRequest<JoinRoomData> = {
        eventType: { type: EventMainType.JOIN_ROOM, subType: EventSubType.CONNECT },
        data: { userId, roomId },
      };
      ws.send(JSON.stringify(connectMessage));
    };

    ws.onmessage = (event) => {
      try {
        const response: WebSocketResponseUnion = JSON.parse(event.data);
        const handlers = callbacksRef.current;

        switch (response.status) {
          case ResponseStatus.CONNECT:
            setConnectedPlayers((prev) => {
              if (!prev.includes(response.player)) {
                return [...prev, response.player];
              }
              return prev;
            });
            handlers.onOpponentConnect?.(response.player);
            break;

          case ResponseStatus.READY:
            handlers.onPlayerReady?.(response.player);
            break;

          case ResponseStatus.START:
            handlers.onGameStart?.();
            break;

          case ResponseStatus.LEADER_SELECTION:
            handlers.onLeaderSelection?.(response.player, response.data);
            break;

          case ResponseStatus.LEADER_SELECTION_RESULT:
            handlers.onLeaderSelectionResult?.(response.data);
            break;

          case ResponseStatus.DISTRIBUTE_CARD:
            handlers.onDistributeCard?.(response.player, response.data);
            break;

          case ResponseStatus.DISTRIBUTED_FLOOR_CARD:
            handlers.onDistributedFloorCard?.(response.data);
            break;

          case ResponseStatus.ANNOUNCE_TURN_INFORMATION:
            handlers.onAnnounceTurnInformation?.(response.data);
            break;

          case ResponseStatus.SUBMIT_CARD:
            handlers.onSubmitCard?.(response.player, response.data);
            break;

          case ResponseStatus.CARD_REVEALED:
            handlers.onCardRevealed?.(response.data);
            break;

          case ResponseStatus.ACQUIRED_CARD:
            handlers.onAcquiredCard?.(response.player, response.data);
            break;

          default:
            const _exhaustiveCheck: never = response;
            console.warn('Unknown message status:', _exhaustiveCheck);
        }
      } catch (err) {
        console.error('WS 메시지 파싱 오류:', err);
      }
    };

    ws.onerror = (error) => console.error('WebSocket 오류:', error);
    ws.onclose = () => setIsConnected(false);

    return () => {
      ws.close();
    };
  }, [userId, roomId]);

  return {
    isConnected,
    connectedPlayers,
    sendMessage: sendRequest,
    sendReady,
    sendLeaderSelection,
    sendNormalSubmit,
  };
};