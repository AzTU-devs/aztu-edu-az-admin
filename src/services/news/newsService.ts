import axios from "axios";
import apiClient from "../../util/apiClient";

export interface NewsGalleryInterface {
    image_id: number;
    image: string;
}

export interface NewsInterface {
    news_id: number;
    cateogry_id: number;
    display_order: number;
    is_active: boolean;
    title: string;
    created_at: string;
}

export const getNews = async (
    start: number,
    end: number,
    category_id: number,
    lang_code?: string,
    sendAs: 'query' | 'header' = 'query'
) => {
    try {
        const params = new URLSearchParams({
            start: String(start),
            end: String(end),
            category_id: String(category_id)
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
            `/api/news/admin/all?${params.toString()}`,
            config
        );

        if (response.data.status_code === 200) {
            return {
                "news": response.data.news,
                "total": response.data.total
            }
        } else if (response.data.status_code === 204) {
            return "NO_CONTENT";
        }
    } catch (err: any) {
        return "ERROR";
    }
}

// reorer news by news_id and new_order

export interface ReOrderNewsPayload {
    news_id: number;
    new_order: number;
}

export const reOrderNews = async (payload: ReOrderNewsPayload) => {
    try {
        const response = await apiClient.post("/api/news/reorder", payload);

        if (response.data.status_code === 200) {
            return "SUCCESS";
        }

        return "ERROR";
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;

            if (status === 404) {
                return "NOT_FOUND";
            }

            return "API_ERROR";
        }

        return "UNKNOWN_ERROR";
    }
};

// get news details by news_id

export interface NewsDetailsInterface {
    news_id: number;
    az_title: string;
    az_html_content: string;
    en_title: string;
    en_html_content: string;
    category_id: string;
    cover_image: string;
    gallery_images: NewsGalleryInterface[];
}

export const getNewsDetails = async (newsId: number) => {
    try {
        const response = await apiClient.get(`/api/news/${newsId}`);

        if (response.data.status_code === 200) {
            return response.data.news;   
        }

        return "ERROR";
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;

            if (status === 404) {
                return "NOT_FOUND";
            }

            return "API_ERROR";
        }

        return "UNKNOWN_ERROR";
    }
}

// delete news using news_id

export const deleteNews = async (newsId: number) => {
    try {
        const response = await apiClient.delete(`/api/news/${newsId}/delete`);

        if (response.data.status_code === 200) {
            return "SUCCESS";
        }

        return "ERROR";
    } catch (error: unknown) {
         if (axios.isAxiosError(error)) {
            const status = error.response?.status;

            if (status === 404) {
                return "NOT_FOUND";
            }

            return "API_ERROR";
        }

        return "UNKNOWN_ERROR";
    }
}