import apiClient from "../../util/apiClient";

export interface LanguageSection {
    faculty_name: string;
    about_text?: string;
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
    day: string;
    time_range: string;
}

export interface ScientificEvent {
    event_title: string;
    event_description: string;
}

export interface EducationItem {
    degree: string;
    university: string;
    start_year: string;
    end_year: string;
}

export interface DirectorPayload {
    first_name: string;
    last_name: string;
    father_name: string;
    scientific_degree: string;
    scientific_title: string;
    email: string;
    phone: string;
    room_number: string;
    profile_image?: string | null;
    working_hours: WorkingHour[];
    scientific_events: ScientificEvent[];
    educations: EducationItem[];
}

export interface DeputyDean {
    first_name: string;
    last_name: string;
    father_name: string;
    scientific_name: string;
    scientific_degree: string;
    email: string;
    phone: string;
    duty: string;
    profile_image?: string | null;
}

export interface ScientificCouncilMember {
    first_name: string;
    last_name: string;
    father_name: string;
    duty: string;
}

export interface Worker {
    first_name: string;
    last_name: string;
    father_name: string;
    duty: string;
    scientific_name: string;
    scientific_degree: string;
    email: string;
}

export interface Faculty {
    faculty_code: string;
    faculty_name: string;
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
    deputy_deans: DeputyDean[];
    scientific_council: ScientificCouncilMember[];
    workers: Worker[];
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
            return "SUCCESS";
        }

        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

export const updateFaculty = async (payload: UpdateFacultyPayload) => {
    try {
        const response = await apiClient.put(`${FACULTY_ADMIN_BASE}/${payload.faculty_code}`, payload, {
            headers: { "Content-Type": "application/json" },
        });

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
