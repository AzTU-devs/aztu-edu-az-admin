import axios from 'axios';
import { RootState, store } from "../redux/store";
import { logout, setSession, tokenRefreshed } from "../redux/slices/authSlice";
import type { MeData, PermissionDeniedError } from "../types/rbac";

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

export const PERMISSION_DENIED_EVENT = 'aztu:permission-denied';

export type PermissionDeniedDetail = {
    required_permission: string | null;
    detail: string | null;
    method: string;
    path: string;
};

/**
 * A 403 means the session is valid but the permission is not held. Refreshing
 * the token cannot change that, so this path never retries — it just tells the
 * UI, which surfaces a toast and leaves the current view alone.
 */
const emitPermissionDenied = (detail: PermissionDeniedDetail) => {
    window.dispatchEvent(new CustomEvent(PERMISSION_DENIED_EVENT, { detail }));
};

/** Fetches the live permission set. Called on the refresh path so a role change lands. */
export const fetchMe = async (): Promise<MeData | null> => {
    try {
        const response = await apiClient.get('/api/auth/me');
        if (response.data?.status_code === 200 && response.data?.data) {
            return response.data.data as MeData;
        }
        return null;
    } catch {
        return null;
    }
};

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
            originalRequest.url?.includes('/auth/logout') ||
            originalRequest.url?.includes('/auth/me');

        // A 403 from /auth/login means "account deactivated", which SignInForm
        // reports itself — only real permission denials are broadcast.
        if (error.response?.status === 403 && !isAuthEndpoint) {
            const body = error.response.data as Partial<PermissionDeniedError> | undefined;
            emitPermissionDenied({
                required_permission: body?.required_permission ?? null,
                detail: body?.detail ?? null,
                method: (originalRequest.method ?? 'get').toUpperCase(),
                path: originalRequest.url ?? '',
            });
            return Promise.reject(error);
        }

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

                store.dispatch(tokenRefreshed({ token: access_token }));
                processQueue(null, access_token);

                const me = await fetchMe();
                if (me) store.dispatch(setSession(me));

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
