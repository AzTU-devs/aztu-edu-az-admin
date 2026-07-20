import apiClient from '../../util/apiClient';
import type { MeData, MeResponse } from '../../types/rbac';

export interface LoginResponse {
  access_token: string;
  token_type: string;
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

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout', {}, { withCredentials: true });
  },
};

export default authService;
