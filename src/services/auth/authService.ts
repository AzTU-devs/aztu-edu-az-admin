import apiClient from '../../util/apiClient';

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

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout', {}, { withCredentials: true });
  },
};

export default authService;
