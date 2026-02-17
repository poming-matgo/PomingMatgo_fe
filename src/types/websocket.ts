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
  GAME: 'GAME',
} as const;

export type EventMainType = typeof EventMainType[keyof typeof EventMainType];

export const EventSubType = {
  CONNECT: 'CONNECT',
  READY: 'READY',
  LEADER_SELECTION: 'LEADER_SELECTION',
  NORMAL_SUBMIT: 'NORMAL_SUBMIT',
  FLOOR_SELECT: 'FLOOR_SELECT',
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
  SUBMIT_CARD: 'SUBMIT_CARD',
  CARD_REVEALED: 'CARD_REVEALED',
  ACQUIRED_CARD: 'ACQUIRED_CARD',
  CHOOSE_FLOOR_CARD: 'CHOOSE_FLOOR_CARD',
} as const;

export type ResponseStatus = typeof ResponseStatus[keyof typeof ResponseStatus];

export interface WebSocketResponse<T = unknown> {
  player: Player;
  status: ResponseStatus;
  message: string;
  data: T | null;
}

// Discriminated Union for type-safe response handling
export type WebSocketResponseUnion =
  | {
      player: Player;
      status: typeof ResponseStatus.CONNECT;
      message: string;
      data: null;
    }
  | {
      player: Player;
      status: typeof ResponseStatus.READY;
      message: string;
      data: null;
    }
  | {
      player: Player;
      status: typeof ResponseStatus.START;
      message: string;
      data: null;
    }
  | {
      player: Player;
      status: typeof ResponseStatus.LEADER_SELECTION;
      message: string;
      data: number;
    }
  | {
      player: Player;
      status: typeof ResponseStatus.LEADER_SELECTION_RESULT;
      message: string;
      data: LeaderSelectionResultData;
    }
  | {
      player: Player;
      status: typeof ResponseStatus.DISTRIBUTE_CARD;
      message: string;
      data: DistributeCardData;
    }
  | {
      player: Player;
      status: typeof ResponseStatus.DISTRIBUTED_FLOOR_CARD;
      message: string;
      data: DistributedFloorCardData;
    }
  | {
      player: Player;
      status: typeof ResponseStatus.ANNOUNCE_TURN_INFORMATION;
      message: string;
      data: AnnounceTurnInformationData;
    }
  | {
      player: Player;
      status: typeof ResponseStatus.SUBMIT_CARD;
      message: string;
      data: string;
    }
  | {
      player: Player;
      status: typeof ResponseStatus.CARD_REVEALED;
      message: string;
      data: string;
    }
  | {
      player: Player;
      status: typeof ResponseStatus.ACQUIRED_CARD;
      message: string;
      data: AcquiredCardData;
    }
  | {
      player: Player;
      status: typeof ResponseStatus.CHOOSE_FLOOR_CARD;
      message: string;
      data: ChooseFloorCardData;
    };

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

// 바닥 카드 선택 관련 타입
export type ChooseFloorCardData = string[]; // ["JAN_4", "JAN_1"]

export interface FloorSelectData {
  cardIndex: string;
}

// 게임 진행 관련 타입
export interface NormalSubmitData {
  cardIndex: string;
}

// ACQUIRED_CARD의 data: { "KKUT": ["SEP_4"], "PI": ["SEP_3"] }
export type AcquiredCardData = Record<string, string[]>;

// Legacy - 기존 호환용
export interface RequestEvent<T = unknown> {
  eventType: string;
  data?: T;
}
