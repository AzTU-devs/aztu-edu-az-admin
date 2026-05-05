import apiClient from "../../util/apiClient";

export interface Announcement {
    announcement_id: number;
    display_order: number;
    is_active: boolean;
    title: string;
    image?: string;
    created_at: string;
}

export interface AnnouncementDetail extends Announcement {
    html_content?: string;
    updated_at?: string;
}

export interface ReOrderAnnouncementPayload {
    announcement_id: number;
    new_order: number;
}

export interface CreateAnnouncementPayload {
    image?: File;
    az: {
        title: string;
        html_content: string;
    };
    en: {
        title: string;
        html_content: string;
    };
}

export const getAnnouncements = async (start: number, end: number, lang: string) => {
    try {
        const response = await apiClient.get(`/api/announcement/admin/all?start=${start}&end=${end}&lang=${lang}`);

        if (response.data.status_code === 200) {
            return {
                announcements: response.data.announcements as Announcement[],
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

export const getAnnouncementDetails = async (announcementId: string, lang: string) => {
    try {
        const response = await apiClient.get(`/api/announcement/${announcementId}?lang=${lang}`);

        if (response.data.status_code === 200) {
            return response.data.announcement as AnnouncementDetail;
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

export const reorderAnnouncement = async (payload: ReOrderAnnouncementPayload) => {
    try {
        const response = await apiClient.post("/api/announcement/reorder", payload);

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

export const createAnnouncement = async (payload: CreateAnnouncementPayload) => {
    try {
        const formData = new FormData();

        if (payload.image) formData.append("image", payload.image);
        formData.append("az_title", payload.az.title);
        formData.append("az_html_content", payload.az.html_content);
        formData.append("en_title", payload.en.title);
        formData.append("en_html_content", payload.en.html_content);

        const response = await apiClient.post("/api/announcement/create", formData, {
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

export const deleteAnnouncement = async (announcementId: number) => {
    try {
        const response = await apiClient.delete(`/api/announcement/${announcementId}/delete`);

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

export const activateAnnouncement = async (announcementId: number) => {
    try {
        const response = await apiClient.post(`/api/announcement/activate?announcement_id=${announcementId}`);
        if (response.data.status_code === 200) return "SUCCESS";
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

export const deactivateAnnouncement = async (announcementId: number) => {
    try {
        const response = await apiClient.post(`/api/announcement/deactivate?announcement_id=${announcementId}`);
        if (response.data.status_code === 200) return "SUCCESS";
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};
