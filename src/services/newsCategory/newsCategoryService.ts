import apiClient from "../../util/apiClient";

export interface NewsCategory {
    category_id: number;
    title: string;
}

export interface CreateNewsCategoryPayload {
    az_title: string;
    en_title: string;
}

export const getNewsCategories = async (lang: string) => {
    try {
        const response = await apiClient.get(`/api/news-category/all?lang_code=${lang}`);

        if (response.data.status_code === 200) {
            return response.data.categories as NewsCategory[];
        } else if (response.data.status_code === 204) {
            return "NO CONTENT";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
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
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        return "ERROR";
    }
};
