import apiClient from "../../util/apiClient";

export interface NewsCategory {
    category_id: number;
    title: string;
    news_count?: number;
}

export interface NewsCategoryDetail {
    category_id: number;
    az_title: string;
    en_title: string;
    news_count: number;
}

export interface CreateNewsCategoryPayload {
    az_title: string;
    en_title: string;
}

export interface UpdateNewsCategoryPayload {
    az_title?: string;
    en_title?: string;
}

export const getNewsCategories = async (lang: string) => {
    try {
        const response = await apiClient.get(`/api/news-category/all?lang=${lang}`);

        if (response.data.status_code === 200) {
            return response.data.news_categories as NewsCategory[];
        } else if (response.data.status_code === 204) {
            return "NO CONTENT";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        return "ERROR";
    }
};

export const getNewsCategoryDetails = async (categoryId: number) => {
    try {
        const response = await apiClient.get(`/api/news-category/${categoryId}`);
        if (response.data.status_code === 200) {
            return response.data.category as NewsCategoryDetail;
        }
        return "ERROR";
    } catch {
        return "ERROR";
    }
};

export const createNewsCategory = async (payload: CreateNewsCategoryPayload) => {
    try {
        const formData = new FormData();
        formData.append("az_title", payload.az_title);
        formData.append("en_title", payload.en_title);

        const response = await apiClient.post("/api/news-category/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.status_code === 201) {
            return "SUCCESS";
        } else if (response.data.status_code === 409) {
            return "EXISTS";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        return "ERROR";
    }
};

export const updateNewsCategory = async (
    categoryId: number,
    payload: UpdateNewsCategoryPayload
) => {
    try {
        const formData = new FormData();
        if (payload.az_title !== undefined) formData.append("az_title", payload.az_title);
        if (payload.en_title !== undefined) formData.append("en_title", payload.en_title);

        const response = await apiClient.patch(`/api/news-category/${categoryId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 200) return "SUCCESS";
        if (response.data.status_code === 404) return "NOT FOUND";
        return "ERROR";
    } catch {
        return "ERROR";
    }
};

export const deleteNewsCategory = async (categoryId: number) => {
    try {
        const response = await apiClient.delete(`/api/news-category/${categoryId}/delete`);
        if (response.data.status_code === 200) return "SUCCESS";
        if (response.data.status_code === 409) return "HAS_NEWS";
        if (response.data.status_code === 404) return "NOT FOUND";
        return "ERROR";
    } catch (err: any) {
        if (err?.response?.data?.status_code === 409) return "HAS_NEWS";
        return "ERROR";
    }
};
