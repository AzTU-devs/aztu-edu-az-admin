import apiClient from "../../util/apiClient";

export interface Collaboration {
    id: number;
    collaboration_id: number;
    name: string;
    logo: string;
    website_url: string | null;
    display_order: number;
    created_at: string;
    updated_at?: string | null;
}

export interface CreateCollaborationPayload {
    logo: File;
    az_name: string;
    en_name: string;
    website_url?: string;
}

export interface UpdateCollaborationPayload {
    collaboration_id: number;
    az_name: string;
    en_name: string;
    logo?: File;
    website_url?: string;
}

export interface ReorderCollaborationPayload {
    collaboration_id: number;
    new_order: number;
}

export const getCollaborations = async (start: number, end: number, lang: string) => {
    try {
        const response = await apiClient.get(`/api/collaboration/all?start=${start}&end=${end}&lang=${lang}`);

        if (response.data.status_code === 200) {
            return {
                collaborations: response.data.collaborations as Collaboration[],
                total: response.data.total as number,
            };
        } else if (response.data.status_code === 204) {
            return "NO CONTENT";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        return "ERROR";
    }
};

export const getCollaborationDetails = async (collaborationId: number, lang: string) => {
    try {
        const response = await apiClient.get(`/api/collaboration/${collaborationId}?lang=${lang}`);

        if (response.data.status_code === 200) {
            return response.data.collaboration as Collaboration;
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return "NOT FOUND";
        }
        return "ERROR";
    }
};

export const createCollaboration = async (payload: CreateCollaborationPayload) => {
    try {
        const formData = new FormData();
        formData.append("logo", payload.logo);
        formData.append("az_name", payload.az_name);
        formData.append("en_name", payload.en_name);
        if (payload.website_url) formData.append("website_url", payload.website_url);

        const response = await apiClient.post("/api/collaboration/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.status_code === 201) {
            return "SUCCESS";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        return "ERROR";
    }
};

export const updateCollaboration = async (payload: UpdateCollaborationPayload) => {
    try {
        const formData = new FormData();
        formData.append("az_name", payload.az_name);
        formData.append("en_name", payload.en_name);
        if (payload.logo) formData.append("logo", payload.logo);
        if (payload.website_url !== undefined) formData.append("website_url", payload.website_url);

        const response = await apiClient.put(`/api/collaboration/${payload.collaboration_id}/update`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.status_code === 200) {
            return "SUCCESS";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return "NOT FOUND";
        }
        return "ERROR";
    }
};

export const reorderCollaboration = async (payload: ReorderCollaborationPayload) => {
    try {
        const response = await apiClient.post("/api/collaboration/reorder", payload);

        if (response.data.status_code === 200) {
            return "SUCCESS";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return "NOT FOUND";
        }
        return "ERROR";
    }
};

export const deleteCollaboration = async (collaborationId: number) => {
    try {
        const response = await apiClient.delete(`/api/collaboration/${collaborationId}/delete`);

        if (response.data.status_code === 200) {
            return "SUCCESS";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return "NOT FOUND";
        }
        return "ERROR";
    }
};
