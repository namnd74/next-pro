export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export type Result<T, E = ApiError> =
  { success: true; data: T; error?: never } | { success: false; data?: never; error: E };
