import apiClient from '../../util/apiClient';
import type { ApiMessage, MeData, MeResponse } from '../../types/rbac';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/api/auth/login',
      { username, password },
      { withCredentials: true }
    );
    return response.data;
  },

  refresh: async (): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/api/auth/refresh',
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  /** Any authenticated admin may call this — no permission required. */
  me: async (): Promise<MeData> => {
    const response = await apiClient.get<MeResponse>('/api/auth/me');
    return response.data.data;
  },

  /**
   * Self-service — any authenticated admin, regardless of role. The server
   * rotates the refresh cookie, so this call must carry credentials or the
   * caller keeps a cookie that no longer matches the stored hash.
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<string> => {
    const response = await apiClient.post<ApiMessage>(
      '/api/auth/change-password',
      payload,
      { withCredentials: true }
    );
    return response.data.message;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout', {}, { withCredentials: true });
  },
};

export default authService;
