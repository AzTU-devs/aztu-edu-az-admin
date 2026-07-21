import apiClient from "../../util/apiClient";

/**
 * One language's worth of project copy. `about_html` is rich text from the
 * Tiptap editor; the rest are short free-text fields.
 *
 * `budget` and `duration` are strings rather than numbers/dates on purpose —
 * real entries read "800000", "250 min manat", "yox" and "01 dekabr 2023-cü il
 * – 01 dekabr 2025-ci il".
 */
export interface ProjectTranslation {
  name: string;
  project_type: string;
  duration: string;
  leader_name: string;
  budget: string;
  about_html: string;
}

/** Shape returned by `GET /admin/{code}` — both languages, for the edit form. */
export interface ResearchProjectDetail {
  id: number;
  project_code: string;
  image: string | null;
  project_url: string | null;
  az: ProjectTranslation;
  en: ProjectTranslation;
  members: string[];
  created_at?: string | null;
  updated_at?: string | null;
}

/** Request body for create/update. The API generates `project_code` itself. */
export interface ResearchProjectPayload {
  image?: string | null;
  project_url?: string | null;
  az: ProjectTranslation;
  en: ProjectTranslation;
  members: { full_name: string }[];
}

export interface ProjectListItem {
  id: number;
  project_code: string;
  name: string | null;
  image: string | null;
  project_url: string | null;
  project_type: string | null;
  duration: string | null;
  leader_name: string | null;
  budget: string | null;
  members: string[];
  created_at: string | null;
}

const RESEARCH_PROJECT_BASE = "/api/research-project";

export const blankTranslation = (): ProjectTranslation => ({
  name: "",
  project_type: "",
  duration: "",
  leader_name: "",
  budget: "",
  about_html: "",
});

export const getProjects = async (start: number, end: number, lang: string = "az") => {
  try {
    const response = await apiClient.get(
      `${RESEARCH_PROJECT_BASE}/admin/all?start=${start}&end=${end}&lang=${lang}`
    );

    // An empty list comes back as a real 204, which leaves axios with no body —
    // so the status is checked before reaching into `data`.
    if (response.status === 204 || response.data?.status_code === 204) {
      return "NO CONTENT" as const;
    }

    if (response.data?.status_code === 200) {
      return {
        projects: (response.data.projects ?? []) as ProjectListItem[],
        total: (response.data.total ?? 0) as number,
      };
    }

    return "ERROR" as const;
  } catch {
    return "ERROR" as const;
  }
};

export const getProjectDetails = async (projectCode: string) => {
  try {
    const response = await apiClient.get(`${RESEARCH_PROJECT_BASE}/admin/${projectCode}`);

    if (response.data?.status_code === 200) {
      return response.data.project as ResearchProjectDetail;
    }

    return "ERROR" as const;
  } catch (err: any) {
    if (err?.response?.status === 404) return "NOT FOUND" as const;
    return "ERROR" as const;
  }
};

/**
 * Create and update both resolve to the project_code, which is what the form
 * needs next: the cover image is uploaded in a second request keyed by it.
 */
export const createProject = async (payload: ResearchProjectPayload) => {
  try {
    const response = await apiClient.post(`${RESEARCH_PROJECT_BASE}/create`, payload);

    if (response.data?.status_code === 201) {
      return {
        status: "SUCCESS" as const,
        projectCode: response.data.data?.project_code as string,
      };
    }

    return { status: "ERROR" as const };
  } catch {
    return { status: "ERROR" as const };
  }
};

export const updateProject = async (
  projectCode: string,
  payload: Partial<ResearchProjectPayload>
) => {
  try {
    const response = await apiClient.put(`${RESEARCH_PROJECT_BASE}/${projectCode}`, payload);

    if (response.data?.status_code === 200) {
      return { status: "SUCCESS" as const, projectCode };
    }

    return { status: "ERROR" as const };
  } catch (err: any) {
    if (err?.response?.status === 404) return { status: "NOT FOUND" as const };
    return { status: "ERROR" as const };
  }
};

export const deleteProject = async (projectCode: string) => {
  try {
    const response = await apiClient.delete(`${RESEARCH_PROJECT_BASE}/${projectCode}`);

    if (response.data?.status_code === 200) return "SUCCESS" as const;

    return "ERROR" as const;
  } catch (err: any) {
    if (err?.response?.status === 404) return "NOT FOUND" as const;
    return "ERROR" as const;
  }
};

export const uploadProjectImage = async (projectCode: string, imageFile: File) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await apiClient.put(
      `${RESEARCH_PROJECT_BASE}/${projectCode}/image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (response.data?.status_code === 200) {
      return { status: "SUCCESS" as const, image: response.data.data?.image as string };
    }

    return { status: "ERROR" as const };
  } catch {
    return { status: "ERROR" as const };
  }
};
