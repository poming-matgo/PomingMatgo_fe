import { useCallback, type RefObject } from 'react';
import { Player } from '../types/websocket';
import { GamePhase, SetupCondition } from '../constants/gamePhase';
import { useGameStore } from '../store/gameStore';
import type {
  DistributeCardData,
  DistributedFloorCardData,
  AnnounceTurnInformationData,
  AcquiredCardData,
  ChooseFloorCardData,
} from '../types/websocket';

const Target = {
  PLAYER: 'player',
  OPPONENT: 'opponent',
} as const;

interface UseWebSocketHandlersProps {
  myPlayer: Player;
  phaseRef: RefObject<GamePhase>;
  addSetupCondition: (condition: string) => void;
  enqueue: (fn: () => void, options?: { interactive?: boolean }) => void;
}

export const useWebSocketHandlers = ({
  myPlayer,
  phaseRef,
  addSetupCondition,
  enqueue,
}: UseWebSocketHandlersProps) => {

  // [세팅] 카드 분배
  const handleDistributeCard = useCallback((msgPlayer: Player, cards: DistributeCardData) => {
    if (msgPlayer === myPlayer) {
      const { setPlayerHand, setOpponentCardCount } = useGameStore.getState();
      setPlayerHand(cards);
      setOpponentCardCount(cards.length);
    }
    addSetupCondition(SetupCondition.HAND);
  }, [myPlayer, addSetupCondition]);

  // [세팅] 바닥 패 배치
  const handleDistributedFloorCard = useCallback((data: DistributedFloorCardData) => {
    const { setFloorCards } = useGameStore.getState();
    setFloorCards(data);
    addSetupCondition(SetupCondition.FLOOR);
  }, [addSetupCondition]);

  // [세팅 & 플레이] 턴 정보 알림
  const handleAnnounceTurnInformation = useCallback((data: AnnounceTurnInformationData) => {
    const { setRoundInfo } = useGameStore.getState();
    if (phaseRef.current === GamePhase.SETUP || phaseRef.current === GamePhase.LEADER_SELECTION) {
      // 초기 세팅 단계에서의 턴 정보
      setRoundInfo(data, myPlayer);
      addSetupCondition(SetupCondition.TURN);
    } else {
      // 게임 중 턴 변경 (애니메이션 큐 사용)
      enqueue(() => setRoundInfo(data, myPlayer));
    }
  }, [myPlayer, phaseRef, addSetupCondition, enqueue]);

  // [플레이] 카드 제출
  const handleSubmitCard = useCallback((msgPlayer: Player, cardName: string) => {
    const { submitMyCard, submitOpponentCard } = useGameStore.getState();
    enqueue(() => {
      if (msgPlayer === myPlayer) {
        submitMyCard(cardName);
      } else {
        submitOpponentCard(cardName);
      }
    });
  }, [myPlayer, enqueue]);

  // [플레이] 덱에서 뒤집기
  const handleCardRevealed = useCallback((cardName: string) => {
    const { revealCard } = useGameStore.getState();
    enqueue(() => {
      revealCard(cardName);
    });
  }, [enqueue]);

  // [플레이] 바닥 카드 선택 요청 (유저 인터랙션 대기)
  const handleChooseFloorCard = useCallback((_msgPlayer: Player, data: ChooseFloorCardData) => {
    const { setFloorCardChoices } = useGameStore.getState();
    enqueue(() => {
      setFloorCardChoices(data);
    }, { interactive: true });
  }, [enqueue]);

  // [플레이] 카드 획득 (쪽/뻑 포함)
  const handleAcquiredCard = useCallback((msgPlayer: Player, data: AcquiredCardData) => {
    const { acquireCards } = useGameStore.getState();
    enqueue(() => {
      const target = msgPlayer === myPlayer ? Target.PLAYER : Target.OPPONENT;
      acquireCards(target, data);
    });
  }, [myPlayer, enqueue]);

  return {
    handleDistributeCard,
    handleDistributedFloorCard,
    handleAnnounceTurnInformation,
    handleSubmitCard,
    handleCardRevealed,
    handleAcquiredCard,
    handleChooseFloorCard,
  };
};
