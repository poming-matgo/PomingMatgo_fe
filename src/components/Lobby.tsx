import { DEV_CONFIG } from '../config/dev';
import { useCreateAndJoinRoom, useJoinRoom } from '../hooks/useRoom';

interface LobbyProps {
  onEnterGame: (userId: string, roomId: string, initialHasOpponent: boolean) => void;
}

export const Lobby = ({ onEnterGame }: LobbyProps) => {
  const createAndJoinMutation = useCreateAndJoinRoom();
  const joinMutation = useJoinRoom();

  const handleCreateRoom = () => {
    createAndJoinMutation.mutate(
      {
        roomId: DEV_CONFIG.DEFAULT_ROOM_ID,
        userId: DEV_CONFIG.PLAYER_1_ID,
      },
      {
        onSuccess: () => {
          // 방 만들기: 상대방 없음
          onEnterGame(DEV_CONFIG.PLAYER_1_ID, DEV_CONFIG.DEFAULT_ROOM_ID, false);
        },
      }
    );
  };

  const handleJoinRoom = () => {
    joinMutation.mutate(
      {
        roomId: DEV_CONFIG.DEFAULT_ROOM_ID,
        userId: DEV_CONFIG.PLAYER_2_ID,
      },
      {
        onSuccess: () => {
          // 게임방 조인: 상대방 이미 있음
          onEnterGame(DEV_CONFIG.PLAYER_2_ID, DEV_CONFIG.DEFAULT_ROOM_ID, true);
        },
      }
    );
  };

  const isLoading = createAndJoinMutation.isPending || joinMutation.isPending;
  const error = createAndJoinMutation.error || joinMutation.error;

  return (
    <div className="w-[600px] bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-8 rounded-2xl shadow-2xl">
      <h1 className="text-white text-3xl font-bold text-center mb-8">
        포밍맞고 (PomingMatgo)
      </h1>

      <div className="text-gray-300 text-sm text-center mb-8">
        <p>서버: {DEV_CONFIG.API_BASE_URL}</p>
        <p>방 ID: {DEV_CONFIG.DEFAULT_ROOM_ID}</p>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-6 text-center">
          {error.message || '오류가 발생했습니다.'}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button
          onClick={handleCreateRoom}
          disabled={isLoading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xl font-bold rounded-xl transition-colors"
        >
          {createAndJoinMutation.isPending ? '처리 중...' : '방 만들기'}
        </button>

        <button
          onClick={handleJoinRoom}
          disabled={isLoading}
          className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white text-xl font-bold rounded-xl transition-colors"
        >
          {joinMutation.isPending ? '처리 중...' : '게임방 조인'}
        </button>
      </div>

      <div className="mt-8 text-gray-400 text-xs text-center">
        <p>방 만들기: Player 1로 참가</p>
        <p>게임방 조인: Player 2로 참가</p>
      </div>
    </div>
  );
};
