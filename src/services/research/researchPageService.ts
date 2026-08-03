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
  /**
   * Rich text of the page's one intro card — the "Strateji baxış" block on the
   * priorities page, the paragraph above the tables on the patents page, the
   * "About the journal" text on a journal page.
   */
  body_html: string | null;
  links_title: string | null;
  /** Journal page. */
  journal_name: string | null;
  journal_language: string | null;
  founder: string | null;
  button_label: string | null;
}

/** One numbered card in the priority grid. */
export interface ResearchPriority {
  id: number;
  display_order: number;
  az: { title: string | null; description: string | null };
  en: { title: string | null; description: string | null };
}

/** One row of a year's patent table. */
export interface ResearchPatent {
  id: number;
  /** Shown verbatim in every language: "İ 2024 0058", "WO2023242086". */
  patent_number: string | null;
  /** An uploaded file's path or a pasted URL — the page treats them alike. */
  document_url: string | null;
  display_order: number;
  az: { name: string | null; authors: string | null };
  en: { name: string | null; authors: string | null };
}

/** One year heading with its own table under it. */
export interface ResearchPatentYear {
  id: number;
  year: string | null;
  patents: ResearchPatent[];
}

/** One seminar/training entry — a rich-text name linking to a news item. */
export interface ResearchSeminar {
  id: number;
  url: string | null;
  display_order: number;
  az: { name: string | null };
  en: { name: string | null };
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
  /** Which form to show: priorities | patents. */
  template: string;
  slug_az: string | null;
  slug_en: string | null;
  is_active: boolean;
  /** Journal page, language-neutral. */
  image_url: string | null;
  issn: string | null;
  eissn: string | null;
  doi: string | null;
  publication_year: string | null;
  yearly_count: string | null;
  button_url: string | null;
  az: ResearchTranslation;
  en: ResearchTranslation;
  priorities: ResearchPriority[];
  /** Oldest year first — the same order the website is served. */
  patent_years: ResearchPatentYear[];
  /** Seminars & Trainings page. */
  seminars: ResearchSeminar[];
  links: ResearchLink[];
  updated_at: string | null;
}

/** Request body for the whole-page save. */
export interface ResearchPagePayload {
  slug_az?: string;
  slug_en?: string;
  /** Journal page, language-neutral. */
  image_url?: string;
  issn?: string;
  eissn?: string;
  doi?: string;
  publication_year?: string;
  yearly_count?: string;
  button_url?: string;
  az?: Partial<ResearchTranslation>;
  en?: Partial<ResearchTranslation>;
  priorities?: Array<{
    az: { title: string; description: string };
    en: { title: string; description: string };
  }>;
  patent_years?: Array<{
    year: string;
    patents: Array<{
      patent_number: string;
      document_url: string;
      az: { name: string; authors: string };
      en: { name: string; authors: string };
    }>;
  }>;
  seminars?: Array<{
    url: string;
    az: { name: string };
    en: { name: string };
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

/**
 * Stores a patent certificate and returns its path for the caller to put in the
 * form. It writes to no row on its own: patent rows are replaced on every save,
 * so the path has to be saved by the same PUT as the rest of the page.
 */
export const uploadResearchDocument = async (pageKey: string, file: File) => {
  try {
    const body = new FormData();
    body.append("file", file);
    const response = await apiClient.put(
      `${BASE}/admin/pages/${pageKey}/document`,
      body
    );
    if (response.data?.status_code === 200 && response.data?.path) {
      return response.data.path as string;
    }
    return null;
  } catch {
    return null;
  }
};

/** Stores a journal cover image and returns its path for the next whole-page save. */
export const uploadResearchImage = async (pageKey: string, file: File) => {
  try {
    const body = new FormData();
    body.append("file", file);
    const response = await apiClient.put(`${BASE}/admin/pages/${pageKey}/image`, body);
    if (response.data?.status_code === 200 && response.data?.path) {
      return response.data.path as string;
    }
    return null;
  } catch {
    return null;
  }
};
