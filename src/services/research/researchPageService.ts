import apiClient from "../../util/apiClient";

/**
 * Research section ("Tədqiqat") — its editorial pages.
 *
 * The same contract as the About section: the page saves as one document —
 * hero copy, the strategic-outlook text, the priority cards and the buttons in
 * a single PUT — which is why there is no per-row CRUD here. Publishing is its
 * own call so saving a draft can never put it live.
 *
 * Not to be confused with `researchInstitute` / `researchProject`, which manage
 * entities rather than pages.
 */

export interface ResearchTranslation {
  title: string | null;
  /** Rich text under the H1 in the hero. */
  description: string | null;
  /** Rich text of the "Strateji baxış" intro card. */
  vision_html: string | null;
  links_title: string | null;
}

/** One numbered card in the priority grid. */
export interface ResearchPriority {
  id: number;
  display_order: number;
  az: { title: string | null; description: string | null };
  en: { title: string | null; description: string | null };
}

export interface ResearchLink {
  id: number;
  url: string | null;
  display_order: number;
  az: { label: string | null };
  en: { label: string | null };
}

export interface ResearchPageDetail {
  id: number;
  page_key: string;
  /** Which form to show. Today: priorities. */
  template: string;
  slug_az: string | null;
  slug_en: string | null;
  is_active: boolean;
  az: ResearchTranslation;
  en: ResearchTranslation;
  priorities: ResearchPriority[];
  links: ResearchLink[];
  updated_at: string | null;
}

/** Request body for the whole-page save. */
export interface ResearchPagePayload {
  slug_az?: string;
  slug_en?: string;
  az?: Partial<ResearchTranslation>;
  en?: Partial<ResearchTranslation>;
  priorities?: Array<{
    az: { title: string; description: string };
    en: { title: string; description: string };
  }>;
  links?: Array<{
    url: string;
    az: { label: string };
    en: { label: string };
  }>;
}

const BASE = "/api/research";

export const getResearchPage = async (pageKey: string) => {
  try {
    const response = await apiClient.get(`${BASE}/admin/pages/${pageKey}`);
    if (response.data?.status_code === 200) {
      return response.data.page as ResearchPageDetail;
    }
    // A 404 means the row was never seeded — a different problem from the API
    // being unreachable, and the screen says so.
    return response.data?.status_code === 404 ? ("NOT FOUND" as const) : ("ERROR" as const);
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return status === 404 ? ("NOT FOUND" as const) : ("ERROR" as const);
  }
};

export const updateResearchPage = async (
  pageKey: string,
  payload: ResearchPagePayload
) => {
  try {
    const response = await apiClient.put(`${BASE}/admin/pages/${pageKey}`, payload);
    return response.data?.status_code === 200 ? ("SUCCESS" as const) : ("ERROR" as const);
  } catch {
    return "ERROR" as const;
  }
};

export const publishResearchPage = async (pageKey: string, isActive: boolean) => {
  try {
    const response = await apiClient.put(`${BASE}/admin/pages/${pageKey}/publish`, {
      is_active: isActive,
    });
    return response.data?.status_code === 200 ? ("SUCCESS" as const) : ("ERROR" as const);
  } catch {
    return "ERROR" as const;
  }
};
