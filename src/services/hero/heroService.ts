import apiClient from "../../util/apiClient";

export interface Hero {
    hero_id: number;
    video: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string | null;
}

export const getHeroes = async () => {
    try {
        const response = await apiClient.get("/api/hero/admin/all");
        if (response.data.status_code === 200) {
            return { heroes: response.data.heroes as Hero[], total: response.data.total as number };
        } else if (response.data.status_code === 204) {
            return "NO CONTENT";
        } else {
            return "ERROR";
        }
    } catch {
        return "ERROR";
    }
};

export const createHero = async (video: File) => {
    try {
        const formData = new FormData();
        formData.append("video", video);
        const response = await apiClient.post("/api/hero/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 201) {
            return "SUCCESS";
        }
        return "ERROR";
    } catch {
        return "ERROR";
    }
};

export const updateHero = async (heroId: number, video: File) => {
    try {
        const formData = new FormData();
        formData.append("video", video);
        const response = await apiClient.put(`/api/hero/${heroId}/update`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 200) return "SUCCESS";
        if (response.data.status_code === 404) return "NOT FOUND";
        return "ERROR";
    } catch (err: any) {
        if (err.response?.status === 404) return "NOT FOUND";
        return "ERROR";
    }
};

export const activateHero = async (heroId: number) => {
    try {
        const response = await apiClient.post(`/api/hero/activate?hero_id=${heroId}`);
        if (response.data.status_code === 200) return "SUCCESS";
        if (response.data.status_code === 404) return "NOT FOUND";
        return "ERROR";
    } catch (err: any) {
        if (err.response?.status === 404) return "NOT FOUND";
        return "ERROR";
    }
};

export const deactivateHero = async (heroId: number) => {
    try {
        const response = await apiClient.post(`/api/hero/deactivate?hero_id=${heroId}`);
        if (response.data.status_code === 200) return "SUCCESS";
        if (response.data.status_code === 404) return "NOT FOUND";
        return "ERROR";
    } catch (err: any) {
        if (err.response?.status === 404) return "NOT FOUND";
        return "ERROR";
    }
};

export const deleteHero = async (heroId: number) => {
    try {
        const response = await apiClient.delete(`/api/hero/${heroId}/delete`);
        if (response.data.status_code === 200) return "SUCCESS";
        if (response.data.status_code === 404) return "NOT FOUND";
        return "ERROR";
    } catch (err: any) {
        if (err.response?.status === 404) return "NOT FOUND";
        return "ERROR";
    }
};
