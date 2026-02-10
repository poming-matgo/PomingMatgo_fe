import { motion, AnimatePresence } from 'framer-motion';

type DealPhase = 'ready' | 'deal-player' | 'deal-opponent' | 'deal-floor' | 'show-turn' | 'done';

interface TurnOverlayProps {
  phase: DealPhase;
  currentTurn: 'player' | 'opponent';
}

export const TurnOverlay = ({ phase, currentTurn }: TurnOverlayProps) => {
  return (
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
  );
};
