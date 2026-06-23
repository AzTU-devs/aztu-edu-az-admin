import apiClient from "../../util/apiClient";

export interface News {
    news_id: number;
    category_id: number;
    display_order: number;
    is_active: boolean;
    title: string;
    created_at: string;
    sdg_numbers?: number[];
    faculty_code?: string | null;
    cafedra_code?: string | null;
    show_in_all_news?: boolean;
}

export interface NewsGalleryImage {
    image_id: number;
    image: string;
    display_order: number;
}

export interface NewsDetail extends News {
    desc?: string;
    html_content?: string;
    updated_at?: string;
    az_title?: string;
    en_title?: string;
    az_html_content?: string;
    en_html_content?: string;
    category_title?: string;
    cover_image?: string;
    cover_image_id?: number;
    gallery_images?: NewsGalleryImage[];
    sdg_numbers?: number[];
    faculty_code?: string | null;
    cafedra_code?: string | null;
}

export interface UpdateNewsPayload {
    az_title?: string;
    en_title?: string;
    az_html_content?: string;
    en_html_content?: string;
    category_id?: number;
    is_active?: boolean;
    cover_image?: File;
    new_gallery_images?: File[];
    removed_image_ids?: number[];
    gallery_order?: { image_id: number; display_order: number }[];
    sdg_numbers?: number[];
    faculty_code?: string | null;
    cafedra_code?: string | null;
    clear_faculty?: boolean;
    clear_cafedra?: boolean;
    show_in_all_news?: boolean;
    created_at?: string;
    display_order?: number;
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
    created_at?: string;
    sdg_numbers?: number[];
    faculty_code?: string | null;
    cafedra_code?: string | null;
    show_in_all_news?: boolean;
}

export const getNews = async (start: number, end: number, lang: string) => {
    try {
        const response = await apiClient.get(`/api/news/admin/all?start=${start}&end=${end}&lang=${lang}`);

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
        if (payload.created_at) formData.append("created_at", payload.created_at);
        if (payload.sdg_numbers && payload.sdg_numbers.length > 0) {
            formData.append("sdg_numbers", JSON.stringify(payload.sdg_numbers));
        }
        if (payload.faculty_code) formData.append("faculty_code", payload.faculty_code);
        if (payload.cafedra_code) formData.append("cafedra_code", payload.cafedra_code);
        if (payload.show_in_all_news !== undefined) {
            formData.append("show_in_all_news", String(payload.show_in_all_news));
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

export const updateNews = async (newsId: number, payload: UpdateNewsPayload) => {
    try {
        const formData = new FormData();
        if (payload.az_title !== undefined) formData.append("az_title", payload.az_title);
        if (payload.en_title !== undefined) formData.append("en_title", payload.en_title);
        if (payload.az_html_content !== undefined) formData.append("az_html_content", payload.az_html_content);
        if (payload.en_html_content !== undefined) formData.append("en_html_content", payload.en_html_content);
        if (payload.category_id !== undefined) formData.append("category_id", String(payload.category_id));
        if (payload.is_active !== undefined) formData.append("is_active", String(payload.is_active));
        if (payload.cover_image) formData.append("cover_image", payload.cover_image);
        if (payload.new_gallery_images && payload.new_gallery_images.length > 0) {
            payload.new_gallery_images.forEach((f) => formData.append("new_gallery_images", f));
        }
        if (payload.removed_image_ids && payload.removed_image_ids.length > 0) {
            formData.append("removed_image_ids", JSON.stringify(payload.removed_image_ids));
        }
        if (payload.gallery_order && payload.gallery_order.length > 0) {
            formData.append("gallery_order", JSON.stringify(payload.gallery_order));
        }
        if (payload.sdg_numbers !== undefined) {
            formData.append("sdg_numbers", JSON.stringify(payload.sdg_numbers));
        }
        if (payload.faculty_code) formData.append("faculty_code", payload.faculty_code);
        if (payload.cafedra_code) formData.append("cafedra_code", payload.cafedra_code);
        if (payload.clear_faculty) formData.append("clear_faculty", "true");
        if (payload.clear_cafedra) formData.append("clear_cafedra", "true");
        if (payload.show_in_all_news !== undefined) {
            formData.append("show_in_all_news", String(payload.show_in_all_news));
        }
        if (payload.created_at !== undefined) formData.append("created_at", payload.created_at);
        if (payload.display_order !== undefined) formData.append("display_order", String(payload.display_order));

        const response = await apiClient.patch(`/api/news/${newsId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.status_code === 200) return "SUCCESS";
        if (response.data.status_code === 404) return "NOT FOUND";
        return "ERROR";
    } catch (err: any) {
        if (err.response && err.response.status === 404) return "NOT FOUND";
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

export const activateNews = async (newsId: number) => {
    try {
        const response = await apiClient.post(`/api/news/activate?news_id=${newsId}`);
        if (response.data.status_code === 200) return "SUCCESS";
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

export const deactivateNews = async (newsId: number) => {
    try {
        const response = await apiClient.post(`/api/news/deactivate?news_id=${newsId}`);
        if (response.data.status_code === 200) return "SUCCESS";
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};
