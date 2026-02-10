export const SetupCondition = {
  HAND: 'HAND',
  FLOOR: 'FLOOR',
  TURN: 'TURN',
} as const;

export type SetupCondition = typeof SetupCondition[keyof typeof SetupCondition];

export const GamePhase = {
  WAITING: 'WAITING',
  LEADER_SELECTION: 'LEADER_SELECTION',
  SETUP: 'SETUP',
  PLAYING: 'PLAYING',
} as const;

export type GamePhase = typeof GamePhase[keyof typeof GamePhase];
