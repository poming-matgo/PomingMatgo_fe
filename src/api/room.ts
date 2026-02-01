import { DEV_CONFIG } from '../config/dev';
import type { ApiResponse, ErrorResponse } from '../types/api';

export interface CreateRoomRequest {
  roomId: string;
}

export interface JoinRoomRequest {
  roomId: string;
  userId: string;
}

export async function createRoom(data: CreateRoomRequest): Promise<ApiResponse | ErrorResponse> {
  const response = await fetch(`${DEV_CONFIG.API_BASE_URL}/room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function joinRoom(data: JoinRoomRequest): Promise<ApiResponse | ErrorResponse> {
  const response = await fetch(`${DEV_CONFIG.API_BASE_URL}/room/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}
