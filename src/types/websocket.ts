export const Player = {
  PLAYER_NOTHING: 'PLAYER_NOTHING',
  PLAYER_1: 'PLAYER_1',
  PLAYER_2: 'PLAYER_2'
} as const;

export type Player = typeof Player[keyof typeof Player];

export const PlayerNumber = {
  PLAYER_NOTHING: 0,
  PLAYER_1: 1,
  PLAYER_2: 2
} as const;

// Event Types
export const EventMainType = {
  JOIN_ROOM: 'JOIN_ROOM',
  ROOM: 'ROOM',
  PREGAME: 'PREGAME',
} as const;

export type EventMainType = typeof EventMainType[keyof typeof EventMainType];

export const EventSubType = {
  CONNECT: 'CONNECT',
  READY: 'READY',
  LEADER_SELECTION: 'LEADER_SELECTION',
} as const;

export type EventSubType = typeof EventSubType[keyof typeof EventSubType];

export interface EventType {
  type: EventMainType;
  subType: EventSubType;
}

// Request
export interface WebSocketRequest<T = unknown> {
  eventType: EventType;
  data: T;
}

export interface JoinRoomData {
  userId: string;
  roomId: string;
}

// Response
export const ResponseStatus = {
  CONNECT: 'CONNECT',
  READY: 'READY',
  START: 'START',
  LEADER_SELECTION: 'LEADER_SELECTION',
  LEADER_SELECTION_RESULT: 'LEADER_SELECTION_RESULT',
  DISTRIBUTE_CARD: 'DISTRIBUTE_CARD',
  DISTRIBUTED_FLOOR_CARD: 'DISTRIBUTED_FLOOR_CARD',
  ANNOUNCE_TURN_INFORMATION: 'ANNOUNCE_TURN_INFORMATION',
} as const;

export type ResponseStatus = typeof ResponseStatus[keyof typeof ResponseStatus];

export interface WebSocketResponse<T = unknown> {
  player: Player;
  status: ResponseStatus;
  message: string;
  data: T | null;
}

// Leader Selection 관련 타입
export interface LeaderSelectionData {
  cardIndex: string;
}

export interface LeaderSelectionResultData {
  player1Month: number;
  player2Month: number;
  leadPlayer: number;
  fiveCards: string[];
}

export interface WebSocketErrorResponse {
  errorCode: string;
  errorMessage: string;
}

// 카드 배분 관련 타입
export type DistributeCardData = string[]; // ["AUG_4", "JUL_1", ...]

export type DistributedFloorCardData = Record<string, string[]>; // { "1": ["JAN_3"], "6": ["JUN_2", "JUN_3"], ... }

export interface AnnounceTurnInformationData {
  round: number;
  turn: number;
  curPlayer: string; // "PLAYER_1" | "PLAYER_2"
}

// Legacy - 기존 호환용
export interface RequestEvent<T = unknown> {
  eventType: string;
  data?: T;
}
