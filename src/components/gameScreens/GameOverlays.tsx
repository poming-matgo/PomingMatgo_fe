import { AnimatePresence, motion } from 'framer-motion';

/** 상대방 고/스톱 선택중 오버레이 */
export const OpponentWaitingOverlay = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-8 py-4">
          <span className="text-white text-lg font-bold animate-pulse">
            상대방이 고/스톱 선택중입니다...
          </span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/** 고 결과 배너 (1초간 표시) */
export const GoResultBanner = ({ text }: { text: string | null | undefined }) => (
  <AnimatePresence>
    {text && (
      <motion.div
        className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.5 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-red-500 text-6xl font-black drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]">
          {text}
        </span>
      </motion.div>
    )}
  </AnimatePresence>
);

/** 고/스톱 선택 모달 */
export const GoStopChoiceModal = ({
  choiceCount,
  onSelect,
}: {
  choiceCount: number | null | undefined;
  onSelect?: (go: boolean) => void;
}) => (
  <AnimatePresence>
    {choiceCount != null && (
      <motion.div
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center gap-6 border border-white/20 shadow-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <h2 className="text-white text-2xl font-bold">고 / 스톱</h2>
          <p className="text-white/70 text-sm">계속 진행하시겠습니까?</p>
          <div className="flex gap-6">
            <button
              onClick={() => onSelect?.(true)}
              className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white text-xl font-bold rounded-xl transition-colors shadow-lg hover:shadow-red-500/30 active:scale-95"
            >
              {choiceCount}고
            </button>
            <button
              onClick={() => onSelect?.(false)}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-xl transition-colors shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
              스톱
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
