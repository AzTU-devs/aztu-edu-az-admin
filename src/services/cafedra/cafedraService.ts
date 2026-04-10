import apiClient from "../../util/apiClient";

export interface LanguageSection {
    title: string;
    html_content?: string;
}

export interface TranslatedTextItem {
    az: {
        title: string;
        description: string;
    };
    en: {
        title: string;
        description: string;
    };
}

export interface WorkingHour {
    az: { day: string };
    en: { day: string };
    time_range: string;
}

export interface EducationItem {
    az: { degree: string; university: string };
    en: { degree: string; university: string };
    start_year: string;
    end_year: string;
}

export interface DirectorPayload {
    first_name: string;
    last_name: string;
    father_name: string;
    az: { scientific_degree: string; scientific_title: string; bio: string; scientific_research_fields: string[] };
    en: { scientific_degree: string; scientific_title: string; bio: string; scientific_research_fields: string[] };
    email: string;
    phone: string;
    room_number: string;
    working_hours: WorkingHour[];
    educations: EducationItem[];
    profile_image?: string;
}

export interface Worker {
    id?: number;
    first_name: string;
    last_name: string;
    father_name: string;
    email: string;
    phone: string;
    az: { duty: string; scientific_name: string; scientific_degree: string };
    en: { duty: string; scientific_name: string; scientific_degree: string };
    profile_image?: string;
}

export interface Cafedra {
    cafedra_code: string;
    faculty_code: string;
    cafedra_name: string;
}

export interface CafedraDetail extends CreateCafedraPayload {
    cafedra_code: string;
}

export interface CreateCafedraPayload {
    faculty_code: string;
    az: LanguageSection;
    en: LanguageSection;
    director?: DirectorPayload | null;
    deputy_dean_count: number;
    deputy_deans: Worker[];
    scientific_council: Worker[];
    workers: Worker[];
    laboratories: TranslatedTextItem[];
    research_works: TranslatedTextItem[];
    partner_companies: TranslatedTextItem[];
    objectives: TranslatedTextItem[];
    duties: TranslatedTextItem[];
    projects: TranslatedTextItem[];
    directions_of_action: TranslatedTextItem[];
    bachelor_programs_count: number;
    master_programs_count: number;
    phd_programs_count: number;
    international_collaborations_count: number;
    laboratories_count: number;
    projects_patents_count: number;
    industrial_collaborations_count: number;
    sdgs: number[];
}

export interface UpdateCafedraPayload extends Partial<CreateCafedraPayload> {
    cafedra_code: string;
}

const CAFEDRA_ADMIN_BASE = "/api/cafedra";

export const getCafedras = async (start: number, end: number, faculty_code?: string) => {
    try {
        let url = `${CAFEDRA_ADMIN_BASE}/admin/all?start=${start}&end=${end}`;
        if (faculty_code) url += `&faculty_code=${faculty_code}`;

        const response = await apiClient.get(url);

        if (response.data.status_code === 200) {
            return {
                cafedras: response.data.cafedras as Cafedra[],
                total: response.data.total as number,
            };
        } else if (response.data.status_code === 204) {
            return "NO CONTENT";
        }

        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

export const getCafedraDetails = async (cafedraCode: string) => {
    try {
        const response = await apiClient.get(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}`);

        if (response.data.status_code === 200) {
            return response.data.cafedra as CafedraDetail;
        }

        return "ERROR";
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return "NOT FOUND";
        }
        return "ERROR";
    }
};

export const createCafedra = async (payload: CreateCafedraPayload) => {
    try {
        const response = await apiClient.post(`${CAFEDRA_ADMIN_BASE}/create`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        if (response.data.status_code === 201) {
            return { status: "SUCCESS", cafedra: response.data.cafedra as CafedraDetail };
        }

        return { status: "ERROR" };
    } catch (err: any) {
        return { status: "ERROR" };
    }
};

export const updateCafedra = async (payload: UpdateCafedraPayload) => {
    try {
        const response = await apiClient.put(`${CAFEDRA_ADMIN_BASE}/${payload.cafedra_code}`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        if (response.data.status_code === 200) {
            return { status: "SUCCESS", cafedra: response.data.cafedra as CafedraDetail };
        }

        return { status: "ERROR" };
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return { status: "NOT FOUND" };
        }
        return { status: "ERROR" };
    }
};

export const deleteCafedra = async (cafedraCode: string) => {
    try {
        const response = await apiClient.delete(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}`);

        if (response.data.status_code === 200) {
            return "SUCCESS";
        }

        return "ERROR";
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return "NOT FOUND";
        }
        return "ERROR";
    }
};

export const uploadCafedraDirectorImage = async (cafedraCode: string, imageFile: File) => {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await apiClient.put(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/director/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 200) {
            return "SUCCESS";
        }
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

export const uploadCafedraWorkerImage = async (workerId: number, imageFile: File) => {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await apiClient.put(`${CAFEDRA_ADMIN_BASE}/workers/${workerId}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 200) {
            return "SUCCESS";
        }
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};
