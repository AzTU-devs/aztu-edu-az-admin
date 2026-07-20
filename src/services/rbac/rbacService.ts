import apiClient from "../../util/apiClient";
import type {
  ApiMessage,
  PermissionDomainGroup,
  PermissionsResponse,
  RoleCreatePayload,
  RoleCreateResponse,
  RoleDetail,
  RoleDetailResponse,
  RoleListItem,
  RoleListResponse,
  RolePermissionsUpdatePayload,
  RoleUpdatePayload,
} from "../../types/rbac";

const rbacService = {
  getPermissions: async (): Promise<PermissionDomainGroup[]> => {
    const response = await apiClient.get<PermissionsResponse>("/api/permissions");
    return response.data.data;
  },

  getRoles: async (): Promise<RoleListItem[]> => {
    const response = await apiClient.get<RoleListResponse>("/api/roles");
    return response.data.data;
  },

  getRole: async (roleId: number): Promise<RoleDetail> => {
    const response = await apiClient.get<RoleDetailResponse>(`/api/roles/${roleId}`);
    return response.data.data;
  },

  createRole: async (payload: RoleCreatePayload): Promise<number> => {
    const response = await apiClient.post<RoleCreateResponse>("/api/roles", payload);
    return response.data.data.id;
  },

  updateRole: async (roleId: number, payload: RoleUpdatePayload): Promise<ApiMessage> => {
    const response = await apiClient.put<ApiMessage>(`/api/roles/${roleId}`, payload);
    return response.data;
  },

  /** Full replace of the grant set, not a delta. */
  updateRolePermissions: async (
    roleId: number,
    payload: RolePermissionsUpdatePayload
  ): Promise<ApiMessage> => {
    const response = await apiClient.put<ApiMessage>(
      `/api/roles/${roleId}/permissions`,
      payload
    );
    return response.data;
  },

  deleteRole: async (roleId: number, reassignToRoleId?: number): Promise<ApiMessage> => {
    const response = await apiClient.delete<ApiMessage>(`/api/roles/${roleId}`, {
      params:
        reassignToRoleId === undefined ? undefined : { reassign_to_role_id: reassignToRoleId },
    });
    return response.data;
  },
};

export default rbacService;
