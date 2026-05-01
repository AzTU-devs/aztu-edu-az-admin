import axios from 'axios';
import { RootState, store } from "../redux/store";
import { loginSuccess, logout } from "../redux/slices/authSlice";

// export const API_BASE_URL = 'http://10.3.43.88:8000';
// export const API_BASE_URL = 'https://api-aztu.karamshukurlu.site';
// export const API_BASE_URL = 'http://localhost:8000';
export const API_BASE_URL = 'https://api.aztu.edu.az';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = (store.getState() as RootState).auth.token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthEndpoint =
            originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/logout');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await apiClient.post(
                    '/api/auth/refresh',
                    {},
                    { withCredentials: true }
                );
                const { access_token } = response.data;

                store.dispatch(loginSuccess({ token: access_token }));
                processQueue(null, access_token);

                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                store.dispatch(logout());
                window.location.href = '/signin';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
