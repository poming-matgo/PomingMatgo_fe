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

export interface RequestEvent<T = unknown> {
  eventType: string;
  data?: T;
}

export interface WebSocketResponse<T = unknown> {
  player: Player;
  status: string;
  message: string;
  data?: T;
}

export interface WebSocketErrorResponse {
  errorCode: string;
  errorMessage: string;
}
