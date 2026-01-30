export const CardType = {
  GWANG: 'GWANG',   // 광
  KKUT: 'KKUT',     // 끗 (10점짜리)
  DDI: 'DDI',       // 띠
  PI: 'PI'          // 피
} as const;

export type CardType = typeof CardType[keyof typeof CardType];

export const SpecialType = {
  HONG_DAN: 'HONG_DAN',     // 홍단
  CHO_DAN: 'CHO_DAN',       // 초단
  CHUNG_DAN: 'CHUNG_DAN',   // 청단
  GODORI: 'GODORI',         // 고도리
  BI_GWANG: 'BI_GWANG',     // 비광 (12월 비광)
  SSANG_PI: 'SSANG_PI'      // 쌍피
} as const;

export type SpecialType = typeof SpecialType[keyof typeof SpecialType];

export const CardName = {
  // 1월 (송학)
  JAN_1: 'JAN_1',
  JAN_2: 'JAN_2',
  JAN_3: 'JAN_3',
  JAN_4: 'JAN_4',

  // 2월 (매조)
  FEB_1: 'FEB_1',
  FEB_2: 'FEB_2',
  FEB_3: 'FEB_3',
  FEB_4: 'FEB_4',

  // 3월 (벚꽃)
  MAR_1: 'MAR_1',
  MAR_2: 'MAR_2',
  MAR_3: 'MAR_3',
  MAR_4: 'MAR_4',

  // 4월 (흑싸리)
  APR_1: 'APR_1',
  APR_2: 'APR_2',
  APR_3: 'APR_3',
  APR_4: 'APR_4',

  // 5월 (난초)
  MAY_1: 'MAY_1',
  MAY_2: 'MAY_2',
  MAY_3: 'MAY_3',
  MAY_4: 'MAY_4',

  // 6월 (모란)
  JUN_1: 'JUN_1',
  JUN_2: 'JUN_2',
  JUN_3: 'JUN_3',
  JUN_4: 'JUN_4',

  // 7월 (홍싸리)
  JUL_1: 'JUL_1',
  JUL_2: 'JUL_2',
  JUL_3: 'JUL_3',
  JUL_4: 'JUL_4',

  // 8월 (공산)
  AUG_1: 'AUG_1',
  AUG_2: 'AUG_2',
  AUG_3: 'AUG_3',
  AUG_4: 'AUG_4',

  // 9월 (국화)
  SEP_1: 'SEP_1',
  SEP_2: 'SEP_2',
  SEP_3: 'SEP_3',
  SEP_4: 'SEP_4',

  // 10월 (단풍)
  OCT_1: 'OCT_1',
  OCT_2: 'OCT_2',
  OCT_3: 'OCT_3',
  OCT_4: 'OCT_4',

  // 11월 (오동)
  NOV_1: 'NOV_1',
  NOV_2: 'NOV_2',
  NOV_3: 'NOV_3',
  NOV_4: 'NOV_4',

  // 12월 (비)
  DEC_1: 'DEC_1',
  DEC_2: 'DEC_2',
  DEC_3: 'DEC_3',
  DEC_4: 'DEC_4'
} as const;

export type CardName = typeof CardName[keyof typeof CardName];

export interface Card {
  name: CardName;
  month: number;
  type: CardType;
  specialType?: SpecialType;
}

export const CARDS: Record<CardName, Card> = {
  JAN_1: { name: CardName.JAN_1, month: 1, type: CardType.GWANG },
  JAN_2: { name: CardName.JAN_2, month: 1, type: CardType.DDI, specialType: SpecialType.HONG_DAN },
  JAN_3: { name: CardName.JAN_3, month: 1, type: CardType.PI },
  JAN_4: { name: CardName.JAN_4, month: 1, type: CardType.PI },

  FEB_1: { name: CardName.FEB_1, month: 2, type: CardType.KKUT, specialType: SpecialType.GODORI },
  FEB_2: { name: CardName.FEB_2, month: 2, type: CardType.DDI, specialType: SpecialType.HONG_DAN },
  FEB_3: { name: CardName.FEB_3, month: 2, type: CardType.PI },
  FEB_4: { name: CardName.FEB_4, month: 2, type: CardType.PI },

  MAR_1: { name: CardName.MAR_1, month: 3, type: CardType.GWANG },
  MAR_2: { name: CardName.MAR_2, month: 3, type: CardType.DDI, specialType: SpecialType.HONG_DAN },
  MAR_3: { name: CardName.MAR_3, month: 3, type: CardType.PI },
  MAR_4: { name: CardName.MAR_4, month: 3, type: CardType.PI },

  APR_1: { name: CardName.APR_1, month: 4, type: CardType.KKUT, specialType: SpecialType.GODORI },
  APR_2: { name: CardName.APR_2, month: 4, type: CardType.DDI, specialType: SpecialType.CHO_DAN },
  APR_3: { name: CardName.APR_3, month: 4, type: CardType.PI },
  APR_4: { name: CardName.APR_4, month: 4, type: CardType.PI },

  MAY_1: { name: CardName.MAY_1, month: 5, type: CardType.KKUT },
  MAY_2: { name: CardName.MAY_2, month: 5, type: CardType.DDI, specialType: SpecialType.CHO_DAN },
  MAY_3: { name: CardName.MAY_3, month: 5, type: CardType.PI },
  MAY_4: { name: CardName.MAY_4, month: 5, type: CardType.PI },

  JUN_1: { name: CardName.JUN_1, month: 6, type: CardType.KKUT },
  JUN_2: { name: CardName.JUN_2, month: 6, type: CardType.DDI, specialType: SpecialType.CHUNG_DAN },
  JUN_3: { name: CardName.JUN_3, month: 6, type: CardType.PI },
  JUN_4: { name: CardName.JUN_4, month: 6, type: CardType.PI },

  JUL_1: { name: CardName.JUL_1, month: 7, type: CardType.KKUT },
  JUL_2: { name: CardName.JUL_2, month: 7, type: CardType.DDI, specialType: SpecialType.CHO_DAN },
  JUL_3: { name: CardName.JUL_3, month: 7, type: CardType.PI },
  JUL_4: { name: CardName.JUL_4, month: 7, type: CardType.PI },

  AUG_1: { name: CardName.AUG_1, month: 8, type: CardType.GWANG },
  AUG_2: { name: CardName.AUG_2, month: 8, type: CardType.KKUT, specialType: SpecialType.GODORI },
  AUG_3: { name: CardName.AUG_3, month: 8, type: CardType.PI },
  AUG_4: { name: CardName.AUG_4, month: 8, type: CardType.PI },

  SEP_1: { name: CardName.SEP_1, month: 9, type: CardType.DDI, specialType: SpecialType.CHUNG_DAN },
  SEP_2: { name: CardName.SEP_2, month: 9, type: CardType.PI },
  SEP_3: { name: CardName.SEP_3, month: 9, type: CardType.PI },
  SEP_4: { name: CardName.SEP_4, month: 9, type: CardType.KKUT },

  OCT_1: { name: CardName.OCT_1, month: 10, type: CardType.KKUT },
  OCT_2: { name: CardName.OCT_2, month: 10, type: CardType.DDI, specialType: SpecialType.CHUNG_DAN },
  OCT_3: { name: CardName.OCT_3, month: 10, type: CardType.PI },
  OCT_4: { name: CardName.OCT_4, month: 10, type: CardType.PI },

  NOV_1: { name: CardName.NOV_1, month: 11, type: CardType.GWANG },
  NOV_2: { name: CardName.NOV_2, month: 11, type: CardType.PI },
  NOV_3: { name: CardName.NOV_3, month: 11, type: CardType.PI },
  NOV_4: { name: CardName.NOV_4, month: 11, type: CardType.PI, specialType: SpecialType.SSANG_PI },

  DEC_1: { name: CardName.DEC_1, month: 12, type: CardType.GWANG, specialType: SpecialType.BI_GWANG },
  DEC_2: { name: CardName.DEC_2, month: 12, type: CardType.KKUT },
  DEC_3: { name: CardName.DEC_3, month: 12, type: CardType.DDI },
  DEC_4: { name: CardName.DEC_4, month: 12, type: CardType.PI, specialType: SpecialType.SSANG_PI }
};

export const ALL_CARDS = Object.values(CARDS);
