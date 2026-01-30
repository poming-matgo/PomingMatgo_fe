export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data?: T;
}

export interface ErrorResponse {
  errorCode: string;
  httpStatus: number;
  errorMessage: string;
}
