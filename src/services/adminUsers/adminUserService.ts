import apiClient from "../../util/apiClient";
import type {
  AdminUserAssignRolePayload,
  AdminUserCreatePayload,
  AdminUserListQuery,
  AdminUserListResponse,
  AdminUserPasswordPayload,
  AdminUserUpdatePayload,
  ApiData,
  ApiMessage,
  Paginated,
  AdminUserListItem,
} from "../../types/rbac";

const adminUserService = {
  list: async (query: AdminUserListQuery = {}): Promise<Paginated<AdminUserListItem>> => {
    const response = await apiClient.get<AdminUserListResponse>("/api/admin-users", {
      params: query,
    });
    return response.data.data;
  },

  create: async (payload: AdminUserCreatePayload): Promise<number> => {
    const response = await apiClient.post<ApiData<{ id: number }>>("/api/admin-users", payload);
    return response.data.data.id;
  },

  update: async (userId: number, payload: AdminUserUpdatePayload): Promise<ApiMessage> => {
    const response = await apiClient.put<ApiMessage>(`/api/admin-users/${userId}`, payload);
    return response.data;
  },

  assignRole: async (
    userId: number,
    payload: AdminUserAssignRolePayload
  ): Promise<ApiMessage> => {
    const response = await apiClient.put<ApiMessage>(`/api/admin-users/${userId}/role`, payload);
    return response.data;
  },

  resetPassword: async (
    userId: number,
    payload: AdminUserPasswordPayload
  ): Promise<ApiMessage> => {
    const response = await apiClient.put<ApiMessage>(
      `/api/admin-users/${userId}/password`,
      payload
    );
    return response.data;
  },

  activate: async (userId: number): Promise<ApiMessage> => {
    const response = await apiClient.post<ApiMessage>(`/api/admin-users/${userId}/activate`);
    return response.data;
  },

  deactivate: async (userId: number): Promise<ApiMessage> => {
    const response = await apiClient.post<ApiMessage>(`/api/admin-users/${userId}/deactivate`);
    return response.data;
  },

  remove: async (userId: number): Promise<ApiMessage> => {
    const response = await apiClient.delete<ApiMessage>(`/api/admin-users/${userId}`);
    return response.data;
  },
};

export default adminUserService;
