import apiClient from "../../util/apiClient";

export interface Faculty {
    faculty_code: string;
    faculty_name: string;
}

export interface CreateFacultyPayload {
    az_name: string;
    en_name: string;
}

export interface UpdateFacultyPayload {
    faculty_code: string;
    az_name?: string;
    en_name?: string;
}

export const getFaculties = async (start: number, end: number, lang: string) => {
    try {
        const response = await apiClient.get(`/api/faculty/admin/all?start=${start}&end=${end}&lang=${lang}`);

        if (response.data.status_code === 200) {
            return {
                faculties: response.data.faculties as Faculty[],
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

export const getFacultyDetails = async (facultyCode: string, lang: string) => {
    try {
        const response = await apiClient.get(`/api/faculty/${facultyCode}?lang=${lang}`);

        if (response.data.status_code === 200) {
            return response.data.faculty as Faculty;
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

export const createFaculty = async (payload: CreateFacultyPayload) => {
    try {
        const formData = new FormData();
        formData.append("az_name", payload.az_name);
        formData.append("en_name", payload.en_name);

        const response = await apiClient.post("/api/faculty/create", formData, {
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

export const updateFaculty = async (payload: UpdateFacultyPayload) => {
    try {
        const formData = new FormData();
        if (payload.az_name !== undefined) formData.append("az_name", payload.az_name);
        if (payload.en_name !== undefined) formData.append("en_name", payload.en_name);

        const response = await apiClient.put(`/api/faculty/${payload.faculty_code}`, formData, {
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

export const deleteFaculty = async (facultyCode: string) => {
    try {
        const response = await apiClient.delete(`/api/faculty/${facultyCode}`);

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
