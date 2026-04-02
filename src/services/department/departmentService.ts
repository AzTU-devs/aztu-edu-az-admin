import apiClient from "../../util/apiClient";

export interface DepartmentListItem {
  id: number;
  department_code: string;
  department_name: string;
  worker_count: number;
  created_at: string;
  updated_at: string;
}

export interface TranslatedHtmlSection {
  department_name: string;
  about_html: string;
}

export interface HtmlContentItem {
  az: { html_content: string };
  en: { html_content: string };
}

export interface WorkingHour {
  time_range: string;
  az: { day: string };
  en: { day: string };
}

export interface EducationItem {
  start_year: string;
  end_year: string;
  az: { degree: string; university: string };
  en: { degree: string; university: string };
}

export interface DirectorPayload {
  first_name: string;
  last_name: string;
  father_name: string;
  email: string;
  phone: string;
  room_number: string;
  profile_image?: string;
  az: {
    scientific_degree: string;
    scientific_title: string;
    bio: string;
  };
  en: {
    scientific_degree: string;
    scientific_title: string;
    bio: string;
  };
  working_hours: WorkingHour[];
  educations: EducationItem[];
}

export interface DepartmentWorker {
  worker_id: number;
  first_name: string;
  last_name: string;
  father_name: string | null;
  email: string | null;
  phone: string | null;
  az: {
    duty: string;
    scientific_degree: string | null;
    scientific_name: string | null;
  };
  en: {
    duty: string;
    scientific_degree: string | null;
    scientific_name: string | null;
  };
  profile_image?: string;
}

export interface DepartmentDetails extends DepartmentListItem {
  az: TranslatedHtmlSection;
  en: TranslatedHtmlSection;
  objectives: HtmlContentItem[];
  core_functions: HtmlContentItem[];
  director: DirectorPayload | null;
  workers: DepartmentWorker[];
}

export interface CreateDepartmentPayload {
  az: TranslatedHtmlSection;
  en: TranslatedHtmlSection;
  objectives: HtmlContentItem[];
  core_functions: HtmlContentItem[];
  director: DirectorPayload | null;
  workers: (Omit<DepartmentWorker, "worker_id" | "profile_image"> & { profile_image?: string })[];
}

export interface ValidationErrors {
  [key: string]: string[];
}

export type DepartmentServiceResponse =
  | { status: "SUCCESS"; data?: any }
  | { status: "VALIDATION"; errors: ValidationErrors }
  | { status: "NOT FOUND" }
  | { status: "ERROR"; data?: any };

export const getDepartments = async (
  start: number,
  end: number,
  lang = "az"
): Promise<{ departments: DepartmentListItem[]; total: number } | "NO CONTENT" | "ERROR"> => {
  try {
    const response = await apiClient.get(`/api/department/admin/all?start=${start}&end=${end}&lang=${lang}`);

    if (response.data.status_code === 200) {
      return {
        departments: response.data.departments as DepartmentListItem[],
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

export const getDepartmentDetails = async (
  departmentCode: string,
  lang = "az"
): Promise<DepartmentDetails | "NOT FOUND" | "ERROR"> => {
  try {
    const response = await apiClient.get(`/api/department/${departmentCode}?lang=${lang}`);

    if (response.data.status_code === 200) {
      return response.data.department as DepartmentDetails;
    }

    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) {
      return "NOT FOUND";
    }
    return "ERROR";
  }
};

export const createDepartment = async (
  payload: CreateDepartmentPayload
): Promise<DepartmentServiceResponse> => {
  try {
    const response = await apiClient.post("/api/department/create", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.status_code === 201) {
      return { status: "SUCCESS", data: response.data.data };
    }

    if (response.data.status_code === 422) {
      return { status: "VALIDATION", errors: response.data.errors ?? {} };
    }

    return { status: "ERROR" };
  } catch (err: any) {
    if (err.response?.status === 422) {
      return { status: "VALIDATION", errors: err.response.data.errors ?? {} };
    }
    return { status: "ERROR" };
  }
};

export const updateDepartment = async (
  departmentCode: string,
  payload: Partial<CreateDepartmentPayload>
): Promise<DepartmentServiceResponse> => {
  try {
    const response = await apiClient.put(`/api/department/${departmentCode}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.status_code === 200) {
      return { status: "SUCCESS", data: response.data.data };
    }

    if (response.data.status_code === 404) {
      return { status: "NOT FOUND" };
    }

    if (response.data.status_code === 422) {
      return { status: "VALIDATION", errors: response.data.errors ?? {} };
    }

    return { status: "ERROR" };
  } catch (err: any) {
    if (err.response?.status === 404) {
      return { status: "NOT FOUND" };
    }
    if (err.response?.status === 422) {
      return { status: "VALIDATION", errors: err.response.data.errors ?? {} };
    }
    return { status: "ERROR" };
  }
};

export const deleteDepartment = async (
  departmentCode: string
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const response = await apiClient.delete(`/api/department/${departmentCode}`);

    if (response.data.status_code === 200) {
      return "SUCCESS";
    }

    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) {
      return "NOT FOUND";
    }
    return "ERROR";
  }
};

export const uploadDirectorImage = async (
  departmentCode: string,
  image: File
): Promise<DepartmentServiceResponse> => {
  try {
    const formData = new FormData();
    formData.append("image", image);

    const response = await apiClient.put(
      `/api/department/${departmentCode}/director/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.status_code === 200) {
      return { status: "SUCCESS", data: response.data.data };
    }
    return { status: "ERROR" };
  } catch (err: any) {
    if (err.response?.status === 413) {
      return { status: "ERROR", data: { message: "File too large" } };
    }
    if (err.response?.status === 415) {
      return { status: "ERROR", data: { message: "Unsupported file type" } };
    }
    return { status: "ERROR" };
  }
};

export const uploadWorkerImage = async (
  workerId: number,
  image: File
): Promise<DepartmentServiceResponse> => {
  try {
    const formData = new FormData();
    formData.append("image", image);

    const response = await apiClient.put(
      `/api/department/workers/${workerId}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.status_code === 200) {
      return { status: "SUCCESS", data: response.data.data };
    }
    return { status: "ERROR" };
  } catch (err: any) {
    if (err.response?.status === 413) {
      return { status: "ERROR", data: { message: "File too large" } };
    }
    if (err.response?.status === 415) {
      return { status: "ERROR", data: { message: "Unsupported file type" } };
    }
    if (err.response?.status === 404) {
      return { status: "NOT FOUND" };
    }
    return { status: "ERROR" };
  }
};
