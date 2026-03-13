import apiClient from "../../util/apiClient";

export interface Slider {
    slider_id: number;
    url: string;
    image?: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    desc: string;
}

export interface ReOrderSliderPayload {
    slider_id: number;
    new_order: number;
}

export interface CreateSliderPayload {
    image: File;
    url: string;
    az: { desc: string };
    en: { desc: string };
}

export interface EditSliderPayload {
    slider_id: number;
    url?: string;
    az_desc?: string;
    en_desc?: string;
    image?: File;
}

export const getSliders = async (start: number, end: number, lang: string) => {
    try {
        const response = await apiClient.get(`/api/slider/all?start=${start}&end=${end}&lang=${lang}`);

        if (response.data.status_code === 200) {
            return {
                sliders: response.data.sliders as Slider[],
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

export const getSliderDetails = async (sliderId: number, lang: string) => {
    try {
        const response = await apiClient.get(`/api/slider/${sliderId}?lang=${lang}`);

        if (response.data.status_code === 200) {
            return response.data.slider as Slider;
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

export const createSlider = async (payload: CreateSliderPayload) => {
    try {
        const formData = new FormData();
        formData.append("image", payload.image);
        formData.append("url", payload.url);
        formData.append("az_desc", payload.az.desc);
        formData.append("en_desc", payload.en.desc);

        const response = await apiClient.post("/api/slider/create", formData, {
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

export const editSlider = async (payload: EditSliderPayload) => {
    try {
        const formData = new FormData();
        if (payload.url !== undefined) formData.append("url", payload.url);
        if (payload.az_desc !== undefined) formData.append("az_desc", payload.az_desc);
        if (payload.en_desc !== undefined) formData.append("en_desc", payload.en_desc);
        if (payload.image) formData.append("image", payload.image);

        const response = await apiClient.put(`/api/slider/${payload.slider_id}/edit`, formData, {
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

export const reorderSlider = async (payload: ReOrderSliderPayload) => {
    try {
        const response = await apiClient.post("/api/slider/reorder", payload);

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

export const deleteSlider = async (sliderId: number) => {
    try {
        const response = await apiClient.delete(`/api/slider/${sliderId}/delete`);

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
