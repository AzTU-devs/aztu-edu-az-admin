import apiClient from "../../util/apiClient";

export interface HonoraryDoctor {
    id: number;
    image: string | null;
    display_order: number;
    is_active: boolean;
    az_full_name: string | null;
    en_full_name: string | null;
    az_description: string | null;
    en_description: string | null;
}

export interface HonoraryDoctorPayload {
    az_full_name: string;
    en_full_name: string;
    az_description?: string;
    en_description?: string;
    /** A newly picked file. Omitted means "leave the current portrait alone". */
    image?: File | null;
    /** Only meaningful on update: clears the stored portrait. */
    remove_image?: boolean;
}

const toFormData = (payload: HonoraryDoctorPayload): FormData => {
    const form = new FormData();
    form.append("az_full_name", payload.az_full_name);
    form.append("en_full_name", payload.en_full_name);
    form.append("az_description", payload.az_description ?? "");
    form.append("en_description", payload.en_description ?? "");
    if (payload.image) form.append("image", payload.image);
    if (payload.remove_image) form.append("remove_image", "true");
    return form;
};

export const getHonoraryDoctors = async () => {
    try {
        const response = await apiClient.get(`/api/honorary-doctor/all?start=0&end=100`);
        if (response.data.status_code === 200) {
            return response.data.doctors as HonoraryDoctor[];
        }
        return "ERROR";
    } catch {
        return "ERROR";
    }
};

export const createHonoraryDoctor = async (payload: HonoraryDoctorPayload) => {
    try {
        const response = await apiClient.post(`/api/honorary-doctor/create`, toFormData(payload));
        return response.data.status_code === 201 ? "SUCCESS" : "ERROR";
    } catch {
        return "ERROR";
    }
};

export const updateHonoraryDoctor = async (id: number, payload: HonoraryDoctorPayload) => {
    try {
        const response = await apiClient.put(`/api/honorary-doctor/${id}/update`, toFormData(payload));
        return response.data.status_code === 200 ? "SUCCESS" : "ERROR";
    } catch {
        return "ERROR";
    }
};

export const deleteHonoraryDoctor = async (id: number) => {
    try {
        const response = await apiClient.delete(`/api/honorary-doctor/${id}/delete`);
        return response.data.status_code === 200 ? "SUCCESS" : "ERROR";
    } catch {
        return "ERROR";
    }
};

export const setHonoraryDoctorActive = async (id: number, isActive: boolean) => {
    try {
        const path = isActive ? "activate" : "deactivate";
        const response = await apiClient.post(`/api/honorary-doctor/${path}?doctor_id=${id}`);
        return response.data.status_code === 200 ? "SUCCESS" : "ERROR";
    } catch {
        return "ERROR";
    }
};

export const reorderHonoraryDoctors = async (ids: number[]) => {
    try {
        const response = await apiClient.post(`/api/honorary-doctor/reorder`, { ids });
        return response.data.status_code === 200 ? "SUCCESS" : "ERROR";
    } catch {
        return "ERROR";
    }
};
