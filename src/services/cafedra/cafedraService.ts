import apiClient from "../../util/apiClient";

export interface Cafedra {
    cafedra_code: string;
    faculty_code: string;
    cafedra_name: string;
}

export interface CreateCafedraPayload {
    faculty_code: string;
    az_name: string;
    en_name: string;
}

export interface UpdateCafedraPayload {
    cafedra_code: string;
    az_name?: string;
    en_name?: string;
}

export const getCafedras = async (start: number, end: number, lang: string, faculty_code?: string) => {
    try {
        let url = `/api/cafedra/admin/all?start=${start}&end=${end}&lang=${lang}`;
        if (faculty_code) url += `&faculty_code=${faculty_code}`;

        const response = await apiClient.get(url);

        if (response.data.status_code === 200) {
            return {
                cafedras: response.data.cafedras as Cafedra[],
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

export const getCafedraDetails = async (cafedraCode: string, lang: string) => {
    try {
        const response = await apiClient.get(`/api/cafedra/${cafedraCode}?lang_code=${lang}`);

        if (response.data.status_code === 200) {
            return response.data.cafedra as Cafedra;
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

export const createCafedra = async (payload: CreateCafedraPayload) => {
    try {
        const formData = new FormData();
        formData.append("faculty_code", payload.faculty_code);
        formData.append("az_name", payload.az_name);
        formData.append("en_name", payload.en_name);

        const response = await apiClient.post("/api/cafedra/create", formData, {
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

export const updateCafedra = async (payload: UpdateCafedraPayload) => {
    try {
        const formData = new FormData();
        if (payload.az_name !== undefined) formData.append("az_name", payload.az_name);
        if (payload.en_name !== undefined) formData.append("en_name", payload.en_name);

        const response = await apiClient.put(`/api/cafedra/${payload.cafedra_code}`, formData, {
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

export const deleteCafedra = async (cafedraCode: string) => {
    try {
        const response = await apiClient.delete(`/api/cafedra/${cafedraCode}`);

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
