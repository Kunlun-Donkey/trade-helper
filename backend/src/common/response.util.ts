export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export function success<T>(data: T, message = 'success'): ApiResponse<T> {
  return { code: 0, message, data };
}

export function error(message = 'error', code = -1): ApiResponse {
  return { code, message, data: null };
}
