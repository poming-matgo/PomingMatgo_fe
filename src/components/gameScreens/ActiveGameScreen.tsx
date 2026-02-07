import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../Card';
import { CapturedArea } from '../CapturedArea';
import type { Player } from '../../types/game';
import type { Card as CardData } from '../../types/card';

interface ActiveGameScreenProps {
  player: Player;
  opponent: Player;
  field: CardData[];
  currentTurn: 'player' | 'opponent';
  isDealing?: boolean;
}

const TOTAL_CARDS = 48;
const CARD_DEAL_INTERVAL = 150;
const PHASE_GAP = 800;
const TURN_DISPLAY_DURATION = 2000;

type DealPhase = 'ready' | 'deal-player' | 'deal-opponent' | 'deal-floor' | 'show-turn' | 'done';

export const ActiveGameScreen = ({
  player,
  opponent,
  field,
  currentTurn,
  isDealing = false,
}: ActiveGameScreenProps) => {
  const [phase, setPhase] = useState<DealPhase>(isDealing ? 'ready' : 'done');
  const [dealtPlayerCount, setDealtPlayerCount] = useState(isDealing ? 0 : player.hand.length);
  const [dealtOpponentCount, setDealtOpponentCount] = useState(isDealing ? 0 : opponent.hand.length);
  const [dealtFloorCount, setDealtFloorCount] = useState(isDealing ? 0 : field.length);

  const dealingDone = phase === 'done';

  // 덱 잔여 수 (서버에서 deck 데이터를 별도로 주지 않으므로 계산)
  const remainingDeck = TOTAL_CARDS - player.hand.length - opponent.hand.length - field.length;

  const deckDisplayCount = useMemo(() => {
    if (!isDealing || dealingDone) return remainingDeck;
    if (phase === 'ready') return TOTAL_CARDS;
    if (phase === 'deal-player') return TOTAL_CARDS - dealtPlayerCount;
    if (phase === 'deal-opponent') return TOTAL_CARDS - player.hand.length - dealtOpponentCount;
    if (phase === 'deal-floor') return TOTAL_CARDS - player.hand.length - opponent.hand.length - dealtFloorCount;
    // show-turn
    return remainingDeck;
  }, [isDealing, dealingDone, phase, dealtPlayerCount, dealtOpponentCount, dealtFloorCount, remainingDeck, player.hand.length, opponent.hand.length]);

  // 딜링 애니메이션 타이머
  useEffect(() => {
    if (!isDealing) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: 내 카드 배분
    timers.push(setTimeout(() => setPhase('deal-player'), 500));
    player.hand.forEach((_, idx) => {
      timers.push(
        setTimeout(() => setDealtPlayerCount(idx + 1), 500 + (idx + 1) * CARD_DEAL_INTERVAL)
      );
    });
    const afterPlayer = 500 + player.hand.length * CARD_DEAL_INTERVAL + PHASE_GAP;

    // Phase 2: 상대 카드 배분
    timers.push(setTimeout(() => setPhase('deal-opponent'), afterPlayer));
    for (let i = 0; i < opponent.hand.length; i++) {
      timers.push(
        setTimeout(() => setDealtOpponentCount(i + 1), afterPlayer + (i + 1) * CARD_DEAL_INTERVAL)
      );
    }
    const afterOpponent = afterPlayer + opponent.hand.length * CARD_DEAL_INTERVAL + PHASE_GAP;

    // Phase 3: 바닥 카드 배분
    timers.push(setTimeout(() => setPhase('deal-floor'), afterOpponent));
    field.forEach((_, idx) => {
      timers.push(
        setTimeout(() => setDealtFloorCount(idx + 1), afterOpponent + (idx + 1) * CARD_DEAL_INTERVAL)
      );
    });
    const afterFloor = afterOpponent + field.length * CARD_DEAL_INTERVAL + PHASE_GAP;

    // Phase 4: 턴 표시
    timers.push(setTimeout(() => setPhase('show-turn'), afterFloor));

    // 완료
    timers.push(setTimeout(() => setPhase('done'), afterFloor + TURN_DISPLAY_DURATION));

    return () => timers.forEach(clearTimeout);
  }, [isDealing, player.hand, opponent.hand, field]);

  // 보이는 카드 수
  const visiblePlayerCards = isDealing && !dealingDone ? player.hand.slice(0, dealtPlayerCount) : player.hand;
  const visibleOpponentCount = isDealing && !dealingDone ? dealtOpponentCount : opponent.hand.length;
  const visibleFloorCards = isDealing && !dealingDone ? field.slice(0, dealtFloorCount) : field;

  // 바닥 카드를 월별로 그룹화
  const groupedFloorCards = visibleFloorCards.reduce((acc, card) => {
    if (!acc[card.month]) acc[card.month] = [];
    acc[card.month].push(card);
    return acc;
  }, {} as Record<number, CardData[]>);

  return (
    <div className="flex-1 flex flex-col gap-1 relative">
      {/* 현재 턴 표시 (딜링 끝난 후) */}
      {dealingDone && (
        <div className="text-center">
          <div className="inline-block px-4 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full">
            {currentTurn === 'player' ? '내 차례' : '상대방 차례'}
          </div>
        </div>
      )}

      {/* 상대방 영역 */}
      <div className="flex-1 flex gap-4 w-full">
        {/* 상대방 손패 */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="text-white font-bold text-sm">상대방 손패</div>
            <div className="text-yellow-400 font-bold text-lg">{opponent.score}점</div>
          </div>
          <div className="bg-gray-700 bg-opacity-40 p-2 rounded-lg min-h-[100px] flex items-center">
            <div className="flex gap-1 justify-center w-full">
              {Array.from({ length: visibleOpponentCount }).map((_, idx) => {
                const card = opponent.hand[idx];
                return isDealing && !dealingDone ? (
                  <motion.div
                    key={`opponent-${idx}`}
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <Card card={card} faceDown />
                  </motion.div>
                ) : (
                  <Card key={`opponent-${idx}`} card={card} faceDown />
                );
              })}
            </div>
          </div>
        </div>
        {/* 상대방 획득 패 */}
        <div className="flex-1">
          <CapturedArea captured={opponent.captured} label="상대방 획득 패" />
        </div>
      </div>

      {/* 중앙: 바닥 패 + 덱 */}
      <div className="flex items-center justify-center gap-6 py-2 flex-shrink-0">
        {/* 덱 */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-white text-sm font-bold">덱</div>
          <div className="relative w-16 h-24">
            {deckDisplayCount > 0 && (
              <>
                <div className="absolute top-1 left-1 w-16 h-24 bg-blue-900 rounded-lg opacity-40" />
                <div className="absolute top-0.5 left-0.5 w-16 h-24 bg-blue-900 rounded-lg opacity-60" />
                <Card card={field[0] ?? player.hand[0]} faceDown className="relative" />
              </>
            )}
          </div>
          {isDealing && !dealingDone ? (
            <motion.div
              key={deckDisplayCount}
              initial={{ scale: 1.3, color: '#fbbf24' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.3 }}
              className="text-white text-xs font-bold"
            >
              남은 카드: {deckDisplayCount}장
            </motion.div>
          ) : (
            <div className="text-white text-xs">남은 카드: {deckDisplayCount}장</div>
          )}
        </div>

        {/* 바닥 패 */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-white text-sm font-bold">바닥 패</div>
          <div className="bg-green-800 bg-opacity-60 p-3 rounded-lg min-w-[500px] min-h-[120px]">
            {visibleFloorCards.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                {isDealing ? '바닥 패 대기중...' : '바닥 패 없음'}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 justify-center">
                {Object.entries(groupedFloorCards)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([month, cards]) => (
                    <div key={month} className="flex flex-col items-center gap-1">
                      <div className="text-white text-xs font-semibold">{month}월</div>
                      <div className="flex relative">
                        {cards.map((card, idx) =>
                          isDealing && !dealingDone ? (
                            <motion.div
                              key={card.name}
                              className="relative"
                              style={{ marginLeft: idx === 0 ? '0' : '-44px' }}
                              initial={{ opacity: 0, y: -30, scale: 0.3 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                              <Card card={card} />
                            </motion.div>
                          ) : (
                            <div
                              key={card.name}
                              className="relative"
                              style={{ marginLeft: idx === 0 ? '0' : '-44px' }}
                            >
                              <Card card={card} />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 플레이어 영역 */}
      <div className="flex-1 flex gap-4 w-full">
        {/* 내 손패 */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="text-white font-bold text-sm">내 손패</div>
            <div className="text-yellow-400 font-bold text-lg">{player.score}점</div>
          </div>
          <div className="bg-gray-700 bg-opacity-40 p-2 rounded-lg min-h-[100px] flex items-center">
            <div className="flex gap-1 justify-center w-full">
              {visiblePlayerCards.map((card) =>
                isDealing && !dealingDone ? (
                  <motion.div
                    key={card.name}
                    initial={{ opacity: 0, y: -50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <Card card={card} />
                  </motion.div>
                ) : (
                  <Card
                    key={card.name}
                    card={card}
                    onClick={() => console.log('Card clicked:', card)}
                  />
                )
              )}
            </div>
          </div>
        </div>
        {/* 내 획득 패 */}
        <div className="flex-1">
          <CapturedArea captured={player.captured} label="내 획득 패" />
        </div>
      </div>

      {/* 턴 안내 오버레이 (딜링 후) */}
      <AnimatePresence>
        {phase === 'show-turn' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg" />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative z-20 flex flex-col items-center gap-3"
            >
              <div className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl shadow-2xl">
                <div className="text-black text-2xl font-bold">
                  {currentTurn === 'player' ? '내 차례입니다!' : '상대방 차례입니다!'}
                </div>
              </div>
              <div className="text-white text-sm">게임 시작!</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};