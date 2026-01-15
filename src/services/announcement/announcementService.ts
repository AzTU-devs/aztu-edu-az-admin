import apiClient from "../../util/apiClient";

export interface Announcement {
    announcement_id: number;
    title: string,
    html_content: string,
    image: string;
    display_order: number;
    is_active: boolean;
    created_at: string
}

export const getAnnouncements = async (
    start: number,
    end: number,
    lang_code?: string,
    sendAs: 'query' | 'header' = 'query'
) => {
    try {
        const params = new URLSearchParams({
            start: String(start),
            end: String(end),
        });

        const config: any = {};

        if (lang_code) {
            if (sendAs === 'query') {
                params.append('lang_code', lang_code);
            } else {
                config.headers = {
                    ...(config.headers || {}),
                    'Accept-Language': lang_code,
                };
            }
        }

        const response = await apiClient.get(
            `/api/announcement/all?${params.toString()}`,
            config
        );

        if (response.data.status_code === 200) {
            return {
                "announcements": response.data.announcements,
                "total": response.data.total
            }
        } else if (response.data.status_code === 204) {
            return "NO_CONTENT";
        }
    } catch (error: any) {
        return "ERROR";
    }
}

// reorder announcement

export interface ReOrderAnnouncementPayload {
    announcement_id: number;
    new_order: number;
}

export const reorderAnnouncement = async (payload: ReOrderAnnouncementPayload) => {
    try {
        const response = await apiClient.post("/api/announcement/reorder", payload);

        if (response.data.status_code === 201) {
            return "SUCCESS";
        }

        return "ERROR";
    } catch (error: any) {
        if (error?.response?.status === 404) {
            return "NOT_FOUND";
        }

        return "ERROR";
    }
}

// delete announcement

export const deleteAnnouncement = async (announcement_id: number) => {
    try {
        const response = await apiClient.delete(`/api/announcement/${announcement_id}/delete`);

        if (response.data.status_code === 200) {
            return "SUCCESS";
        }

        return "ERROR";
    } catch (error: any) {
        if (error?.response?.status === 404) {
            return "NOT_FOUND";
        }

        return "ERROR";
    }
}