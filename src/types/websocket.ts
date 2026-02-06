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

// Legacy - 기존 호환용
export interface RequestEvent<T = unknown> {
  eventType: string;
  data?: T;
}
