import apiClient from "../../util/apiClient";

export interface News {
    news_id: number;
    cateogry_id: number;
    display_order: number;
    is_active: boolean;
    title: string;
    created_at: string;
}

export interface NewsDetail extends News {
    desc?: string;
    html_content?: string;
    updated_at?: string;
}

export interface ReOrderNewsPayload {
    news_id: number;
    new_order: number;
}

export interface CreateNewsPayload {
    category_id: number;
    az_title: string;
    az_html_content: string;
    en_title: string;
    en_html_content: string;
    cover_image: File;
    gallery_images?: File[];
}

export const getNews = async (start: number, end: number, lang: string) => {
    try {
        const response = await apiClient.get(`/api/news/all?start=${start}&end=${end}&lang=${lang}`);

        if (response.data.status_code === 200) {
            return {
                news: response.data.news as News[],
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

export const getNewsDetails = async (newsId: string, lang: string) => {
    try {
        const response = await apiClient.get(`/api/news/${newsId}?lang=${lang}`);

        if (response.data.status_code === 200) {
            return response.data.news as NewsDetail;
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

export const reorderNews = async (payload: ReOrderNewsPayload) => {
    try {
        const response = await apiClient.post("/api/news/reorder", payload);

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

export const createNews = async (payload: CreateNewsPayload) => {
    try {
        const formData = new FormData();
        formData.append("category_id", String(payload.category_id));
        formData.append("az_title", payload.az_title);
        formData.append("az_html_content", payload.az_html_content);
        formData.append("en_title", payload.en_title);
        formData.append("en_html_content", payload.en_html_content);
        formData.append("cover_image", payload.cover_image);
        if (payload.gallery_images) {
            payload.gallery_images.forEach((file) => formData.append("gallery_images", file));
        }

        const response = await apiClient.post("/api/news/create", formData, {
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

export const deleteNews = async (newsId: number) => {
    try {
        const response = await apiClient.delete(`/api/news/${newsId}/delete`);

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

export const toggleNewsStatus = async (newsId: number) => {
    try {
        const response = await apiClient.patch(`/api/news/${newsId}/toggle`);

        if (response.data.status_code === 200) {
            return "SUCCESS";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        return "ERROR";
    }
};
