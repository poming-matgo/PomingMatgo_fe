// 개발용 서버 설정 파일
// 서버 주소를 변경하려면 이 파일을 수정하세요

export const DEV_CONFIG = {
  // API 서버 주소
  API_BASE_URL: 'http://127.0.0.1:8084',

  // WebSocket 서버 주소
  WS_URL: 'ws://localhost:8084/gostop',

  // 고정된 방 ID (임시)
  DEFAULT_ROOM_ID: '1',

  // 고정된 플레이어 ID (임시)
  PLAYER_1_ID: '1',  // 방 만들기 시 사용
  PLAYER_2_ID: '2',  // 게임방 조인 시 사용
};
