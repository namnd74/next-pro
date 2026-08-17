import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { ApiError, Result } from '@/types/api';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Client-side authentication token injection
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const token = parsed?.state?.token;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // Ignore JSON parse errors for safety
        }
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const errorData: ApiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected server error occurred',
      statusCode: error.response?.status,
      errors: error.response?.data?.errors,
    };

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Optional: Trigger custom 401 redirect or store reset
      }
    }

    return Promise.reject(errorData);
  }
);

/**
 * Safe API caller returning Result<T> pattern
 */
export async function safeRequest<T>(
  config: AxiosRequestConfig
): Promise<Result<T, ApiError>> {
  try {
    const response = await apiClient.request<T>(config);
    return { success: true, data: response.data };
  } catch (err) {
    const error = err as ApiError;
    return { success: false, error };
  }
}
