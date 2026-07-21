import apiClient from "../../util/apiClient";

/**
 * One language's worth of institute copy. Everything except `name` is rich text
 * produced by the Tiptap editor, so these are HTML strings, not plain text.
 */
export interface InstituteTranslation {
  name: string;
  about_html: string;
  vision_html: string;
  mission_html: string;
  goals_html: string;
  additional_info_html: string;
}

/** Shape returned by `GET /admin/{code}` — both languages, for the edit form. */
export interface ResearchInstituteDetail {
  id: number;
  institute_code: string;
  image: string | null;
  website_url: string | null;
  email: string | null;
  az: InstituteTranslation;
  en: InstituteTranslation;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Request body for create/update. The API generates `institute_code` itself. */
export interface ResearchInstitutePayload {
  image?: string | null;
  website_url?: string | null;
  email?: string | null;
  az: InstituteTranslation;
  en: InstituteTranslation;
}

export interface InstituteListItem {
  id: number;
  institute_code: string;
  name: string | null;
  image: string | null;
  website_url: string | null;
  email: string | null;
  staff_count: number;
  created_at: string | null;
}

const RESEARCH_INSTITUTE_BASE = "/api/research-institute";

export const blankTranslation = (): InstituteTranslation => ({
  name: "",
  about_html: "",
  vision_html: "",
  mission_html: "",
  goals_html: "",
  additional_info_html: "",
});

export const getInstitutes = async (start: number, end: number, lang: string = "az") => {
  try {
    const response = await apiClient.get(
      `${RESEARCH_INSTITUTE_BASE}/admin/all?start=${start}&end=${end}&lang=${lang}`
    );

    // An empty list comes back as a real 204, which leaves axios with no body —
    // so the status is checked before reaching into `data`.
    if (response.status === 204 || response.data?.status_code === 204) {
      return "NO CONTENT" as const;
    }

    if (response.data?.status_code === 200) {
      return {
        institutes: (response.data.institutes ?? []) as InstituteListItem[],
        total: (response.data.total ?? 0) as number,
      };
    }

    return "ERROR" as const;
  } catch {
    return "ERROR" as const;
  }
};

export const getInstituteDetails = async (instituteCode: string) => {
  try {
    const response = await apiClient.get(`${RESEARCH_INSTITUTE_BASE}/admin/${instituteCode}`);

    if (response.data?.status_code === 200) {
      return response.data.institute as ResearchInstituteDetail;
    }

    return "ERROR" as const;
  } catch (err: any) {
    if (err?.response?.status === 404) return "NOT FOUND" as const;
    return "ERROR" as const;
  }
};

/**
 * Create and update both resolve to the institute_code, which is what the form
 * needs next: the logo is uploaded in a second request keyed by that code.
 */
export const createInstitute = async (payload: ResearchInstitutePayload) => {
  try {
    const response = await apiClient.post(`${RESEARCH_INSTITUTE_BASE}/create`, payload);

    if (response.data?.status_code === 201) {
      return {
        status: "SUCCESS" as const,
        instituteCode: response.data.data?.institute_code as string,
      };
    }

    return { status: "ERROR" as const };
  } catch {
    return { status: "ERROR" as const };
  }
};

export const updateInstitute = async (
  instituteCode: string,
  payload: Partial<ResearchInstitutePayload>
) => {
  try {
    const response = await apiClient.put(`${RESEARCH_INSTITUTE_BASE}/${instituteCode}`, payload);

    if (response.data?.status_code === 200) {
      return { status: "SUCCESS" as const, instituteCode };
    }

    return { status: "ERROR" as const };
  } catch (err: any) {
    if (err?.response?.status === 404) return { status: "NOT FOUND" as const };
    return { status: "ERROR" as const };
  }
};

export const deleteInstitute = async (instituteCode: string) => {
  try {
    const response = await apiClient.delete(`${RESEARCH_INSTITUTE_BASE}/${instituteCode}`);

    if (response.data?.status_code === 200) return "SUCCESS" as const;

    return "ERROR" as const;
  } catch (err: any) {
    if (err?.response?.status === 404) return "NOT FOUND" as const;
    return "ERROR" as const;
  }
};

export const uploadInstituteImage = async (instituteCode: string, imageFile: File) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await apiClient.put(
      `${RESEARCH_INSTITUTE_BASE}/${instituteCode}/image`,
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
