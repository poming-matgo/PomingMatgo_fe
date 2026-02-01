import { useMutation } from '@tanstack/react-query';
import { createRoom, joinRoom, type CreateRoomRequest, type JoinRoomRequest } from '../api/room';

export const useCreateRoom = () => {
  return useMutation({
    mutationFn: createRoom,
  });
};

export const useJoinRoom = () => {
  return useMutation({
    mutationFn: joinRoom,
  });
};

// 방 만들기 + 참가를 한번에 처리하는 hook
export const useCreateAndJoinRoom = () => {
  return useMutation({
    mutationFn: async (data: CreateRoomRequest & JoinRoomRequest) => {
      const createResult = await createRoom({ roomId: data.roomId });
      console.log('방 생성 결과:', createResult);

      const joinResult = await joinRoom({ roomId: data.roomId, userId: data.userId });
      console.log('방 참가 결과:', joinResult);

      return { createResult, joinResult };
    },
  });
};
