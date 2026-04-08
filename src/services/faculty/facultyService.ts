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

export interface DeputyDean {
    id?: number;
    first_name: string;
    last_name: string;
    father_name: string;
    email: string;
    phone: string;
    az: { scientific_name: string; scientific_degree: string; duty: string };
    en: { scientific_name: string; scientific_degree: string; duty: string };
    profile_image?: string;
}

export interface ScientificCouncilMember {
    first_name: string;
    last_name: string;
    father_name: string;
    email: string;
    phone: string;
    az: { duty: string; scientific_name: string; scientific_degree: string };
    en: { duty: string; scientific_name: string; scientific_degree: string };
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

export interface Faculty {
    faculty_code: string;
    title: string;
}

export interface FacultyDetail extends CreateFacultyPayload {
    faculty_code: string;
}

export interface CreateFacultyPayload {
    az: LanguageSection;
    en: LanguageSection;
    director?: DirectorPayload | null;
    laboratories: TranslatedTextItem[];
    research_works: TranslatedTextItem[];
    partner_companies: TranslatedTextItem[];
    objectives: TranslatedTextItem[];
    duties: TranslatedTextItem[];
    projects: TranslatedTextItem[];
    directions_of_action: TranslatedTextItem[];
    deputy_deans: DeputyDean[];
    scientific_council: ScientificCouncilMember[];
    workers: Worker[];
    bachelor_programs_count: number;
    master_programs_count: number;
    phd_programs_count: number;
    international_collaborations_count: number;
    laboratories_count: number;
    projects_patents_count: number;
    industrial_collaborations_count: number;
    sdgs: number[];
}

export interface UpdateFacultyPayload extends CreateFacultyPayload {
    faculty_code: string;
}

const FACULTY_ADMIN_BASE = "/api/faculty";

export const getFaculties = async (start: number, end: number) => {
    try {
        const response = await apiClient.get(`${FACULTY_ADMIN_BASE}/admin/all?start=${start}&end=${end}`);

        if (response.data.status_code === 200) {
            return {
                faculties: response.data.faculties as Faculty[],
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

export const getFacultyDetails = async (facultyCode: string) => {
    try {
        const response = await apiClient.get(`${FACULTY_ADMIN_BASE}/${facultyCode}`);

        if (response.data.status_code === 200) {
            return response.data.faculty as FacultyDetail;
        }

        return "ERROR";
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return "NOT FOUND";
        }
        return "ERROR";
    }
};

export const createFaculty = async (payload: CreateFacultyPayload) => {
    try {
        const response = await apiClient.post(`${FACULTY_ADMIN_BASE}/create`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        if (response.data.status_code === 201) {
            return { status: "SUCCESS", faculty: response.data.faculty as FacultyDetail };
        }

        return { status: "ERROR" };
    } catch (err: any) {
        return { status: "ERROR" };
    }
};

export const updateFaculty = async (payload: UpdateFacultyPayload) => {
    try {
        const response = await apiClient.put(`${FACULTY_ADMIN_BASE}/${payload.faculty_code}`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        if (response.data.status_code === 200) {
            return { status: "SUCCESS", faculty: response.data.faculty as FacultyDetail };
        }

        return { status: "ERROR" };
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return { status: "NOT FOUND" };
        }
        return { status: "ERROR" };
    }
};

export const deleteFaculty = async (facultyCode: string) => {
    try {
        const response = await apiClient.delete(`${FACULTY_ADMIN_BASE}/${facultyCode}`);

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

export const uploadDirectorImage = async (facultyCode: string, imageFile: File) => {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await apiClient.put(`${FACULTY_ADMIN_BASE}/${facultyCode}/director/image`, formData, {
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

export const uploadDeputyDeanImage = async (deputyDeanId: number, imageFile: File) => {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await apiClient.put(`${FACULTY_ADMIN_BASE}/deputy-deans/${deputyDeanId}/image`, formData, {
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

export const uploadWorkerImage = async (workerId: number, imageFile: File) => {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await apiClient.put(`${FACULTY_ADMIN_BASE}/workers/${workerId}/image`, formData, {
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
