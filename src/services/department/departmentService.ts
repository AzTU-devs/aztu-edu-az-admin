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

// The department detail endpoint returns a single language (flattened) per `?lang=`.
// We fetch az + en and merge them into the nested az/en shape the form and the worker
// manager expect.
const fetchDepartmentRaw = async (departmentCode: string, lang: string): Promise<any | "NOT FOUND" | "ERROR"> => {
  try {
    const response = await apiClient.get(`/api/department/${departmentCode}?lang=${lang}`);
    if (response.data.status_code === 200) return response.data.department;
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

const mergeDeptWorkers = (azArr: any[] = [], enArr: any[] = []) =>
  (azArr ?? []).map((a, i) => {
    const e = enArr?.[i] ?? {};
    return {
      id: a.id,
      worker_id: a.id,
      first_name: a.first_name ?? "",
      last_name: a.last_name ?? "",
      father_name: a.father_name ?? "",
      email: a.email ?? "",
      phone: a.phone ?? "",
      profile_image: a.profile_image,
      az: { duty: a.duty ?? "", scientific_degree: a.scientific_degree ?? "", scientific_name: a.scientific_name ?? "" },
      en: { duty: e.duty ?? "", scientific_degree: e.scientific_degree ?? "", scientific_name: e.scientific_name ?? "" },
    };
  });

const mergeHtmlSection = (azArr: any[] = [], enArr: any[] = []) =>
  (azArr ?? []).map((a, i) => ({
    az: { html_content: a.html_content ?? "" },
    en: { html_content: enArr?.[i]?.html_content ?? "" },
  }));

const mergeDeptDirector = (a: any, e: any) => {
  if (!a) return null;
  e = e ?? {};
  return {
    first_name: a.first_name ?? "",
    last_name: a.last_name ?? "",
    father_name: a.father_name ?? "",
    email: a.email ?? "",
    phone: a.phone ?? "",
    room_number: a.room_number ?? "",
    profile_image: a.profile_image,
    az: { scientific_degree: a.scientific_degree ?? "", scientific_title: a.scientific_title ?? "", bio: a.bio ?? "" },
    en: { scientific_degree: e.scientific_degree ?? "", scientific_title: e.scientific_title ?? "", bio: e.bio ?? "" },
    working_hours: (a.working_hours ?? []).map((wh: any, i: number) => ({
      time_range: wh.time_range ?? "",
      az: { day: wh.day ?? "" },
      en: { day: e.working_hours?.[i]?.day ?? "" },
    })),
    educations: (a.educations ?? []).map((ed: any, i: number) => ({
      start_year: ed.start_year ?? "",
      end_year: ed.end_year ?? "",
      az: { degree: ed.degree ?? "", university: ed.university ?? "" },
      en: { degree: e.educations?.[i]?.degree ?? "", university: e.educations?.[i]?.university ?? "" },
    })),
  };
};

export const getDepartmentDetails = async (
  departmentCode: string,
  _lang = "az"
): Promise<DepartmentDetails | "NOT FOUND" | "ERROR"> => {
  const [az, en] = await Promise.all([
    fetchDepartmentRaw(departmentCode, "az"),
    fetchDepartmentRaw(departmentCode, "en"),
  ]);

  if (az === "NOT FOUND" || en === "NOT FOUND") return "NOT FOUND";
  if (az === "ERROR" || en === "ERROR" || !az) return "ERROR";

  const enObj = typeof en === "object" && en ? en : {};

  const merged = {
    ...az,
    az: { department_name: az.department_name ?? "", about_html: az.about_html ?? "" },
    en: { department_name: enObj.department_name ?? "", about_html: enObj.about_html ?? "" },
    objectives: mergeHtmlSection(az.objectives, enObj.objectives),
    core_functions: mergeHtmlSection(az.core_functions, enObj.core_functions),
    director: mergeDeptDirector(az.director, enObj.director),
    workers: mergeDeptWorkers(az.workers, enObj.workers),
  };

  return merged as unknown as DepartmentDetails;
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

// ============================================================
// Standalone worker CRUD (incremental management on detail page)
// ============================================================

/** Create/update payload for a single department worker. */
export type DepartmentWorkerPayload = {
  first_name: string;
  last_name: string;
  father_name: string;
  email: string;
  phone: string;
  az: { duty: string; scientific_degree: string; scientific_name: string };
  en: { duty: string; scientific_degree: string; scientific_name: string };
};

export type CreateResult = { status: "SUCCESS"; id: number } | { status: "ERROR" };
export type MutateResult = "SUCCESS" | "NOT FOUND" | "ERROR";

export const createDepartmentWorker = async (
  departmentCode: string,
  payload: DepartmentWorkerPayload
): Promise<CreateResult> => {
  try {
    const response = await apiClient.post(`/api/department/${departmentCode}/workers`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    if (response.data.status_code === 201) {
      return { status: "SUCCESS", id: response.data.data?.id as number };
    }
    return { status: "ERROR" };
  } catch {
    return { status: "ERROR" };
  }
};

export const updateDepartmentWorker = async (
  workerId: number,
  payload: DepartmentWorkerPayload
): Promise<MutateResult> => {
  try {
    const response = await apiClient.put(`/api/department/workers/${workerId}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    if (response.data.status_code === 200) return "SUCCESS";
    if (response.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteDepartmentWorker = async (workerId: number): Promise<MutateResult> => {
  try {
    const response = await apiClient.delete(`/api/department/workers/${workerId}`);
    if (response.data.status_code === 200) return "SUCCESS";
    if (response.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};
