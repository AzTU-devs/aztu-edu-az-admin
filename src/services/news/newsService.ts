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
    cateogry_id: number;
    az: {
        title: string;
        desc: string;
        content_html: string;
    };
    en: {
        title: string;
        desc: string;
        content_html: string;
    };
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
        const response = await apiClient.post("/api/news/create", payload);

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
