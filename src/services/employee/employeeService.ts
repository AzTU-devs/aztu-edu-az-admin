import apiClient from "../../util/apiClient";

export interface OfficeHour {
    day: string;
    start_time: string;
    end_time: string;
}

export interface Education {
    degree_level: string;
    institution: string;
    specialization: string;
    graduation_year: string;
}

export interface Course {
    course_name: string;
    education_level: string;
    publications?: string;
}

export interface EmployeeContact {
    building?: string;
    floor?: string;
    room?: string;
    email?: string;
    phone?: string;
}

export interface EmployeeResearch {
    scientific_interests?: string;
    scopus_url?: string;
    google_scholar_url?: string;
    orcid?: string;
    researchgate_url?: string;
    academia_url?: string;
}

export interface Employee {
    id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    full_name: string;
    profile_image: string;
    academic_degree: string;
    academic_title: string;
    position: string;
    faculty_code: string;
    cafedra_code: string;
    biography: string;
    contact?: EmployeeContact;
    office_hours?: OfficeHour[];
    education?: Education[];
    courses?: Course[];
    research?: EmployeeResearch;
    created_at: string;
    updated_at: string | null;
}

export interface CreateEmployeePayload {
    first_name: string;
    last_name: string;
    academic_degree: string;
    academic_title: string;
    position: string;
    faculty_code: string;
    cafedra_code: string;
    biography: string;
    profile_image?: File;
    contact?: EmployeeContact;
    office_hours?: OfficeHour[];
    education?: Education[];
    courses?: Course[];
    research?: EmployeeResearch;
}

export interface UpdateEmployeePayload extends CreateEmployeePayload {
    employee_id: number;
}

export const getEmployees = async (start: number, end: number) => {
    try {
        const response = await apiClient.get(`/api/employee/admin/all?start=${start}&end=${end}`);
        if (response.data.status_code === 200) {
            return {
                employees: response.data.employees as Employee[],
                total: response.data.total as number,
            };
        } else if (response.data.status_code === 204) {
            return "NO CONTENT";
        } else {
            return "ERROR";
        }
    } catch {
        return "ERROR";
    }
};

export const getEmployeeDetails = async (employeeId: number) => {
    try {
        const response = await apiClient.get(`/api/employee/${employeeId}`);
        if (response.data.status_code === 200) {
            return response.data.employee as Employee;
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        if (err.response?.status === 404) return "NOT FOUND";
        return "ERROR";
    }
};

const buildFormData = (payload: CreateEmployeePayload): FormData => {
    const formData = new FormData();
    formData.append("first_name", payload.first_name);
    formData.append("last_name", payload.last_name);
    formData.append("academic_degree", payload.academic_degree);
    formData.append("academic_title", payload.academic_title);
    formData.append("position", payload.position);
    formData.append("faculty_code", payload.faculty_code);
    formData.append("cafedra_code", payload.cafedra_code);
    formData.append("biography", payload.biography);
    if (payload.profile_image) formData.append("profile_image", payload.profile_image);
    if (payload.contact) formData.append("contact", JSON.stringify(payload.contact));
    if (payload.office_hours?.length) formData.append("office_hours", JSON.stringify(payload.office_hours));
    if (payload.education?.length) formData.append("education", JSON.stringify(payload.education));
    if (payload.courses?.length) formData.append("courses", JSON.stringify(payload.courses));
    if (payload.research) formData.append("research", JSON.stringify(payload.research));
    return formData;
};

export const createEmployee = async (payload: CreateEmployeePayload) => {
    try {
        const response = await apiClient.post("/api/employee/create", buildFormData(payload), {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 201) return "SUCCESS";
        return "ERROR";
    } catch {
        return "ERROR";
    }
};

export const updateEmployee = async (payload: UpdateEmployeePayload) => {
    try {
        const response = await apiClient.put(`/api/employee/${payload.employee_id}/update`, buildFormData(payload), {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 200) return "SUCCESS";
        return "ERROR";
    } catch (err: any) {
        if (err.response?.status === 404) return "NOT FOUND";
        return "ERROR";
    }
};

export const deleteEmployee = async (employeeId: number) => {
    try {
        const response = await apiClient.delete(`/api/employee/${employeeId}/delete`);
        if (response.data.status_code === 200) return "SUCCESS";
        return "ERROR";
    } catch (err: any) {
        if (err.response?.status === 404) return "NOT FOUND";
        return "ERROR";
    }
};
