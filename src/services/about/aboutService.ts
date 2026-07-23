import apiClient from "../../util/apiClient";

/**
 * About section ("Haqqımızda").
 *
 * The page saves as one document — hero copy, statement cards and buttons in a
 * single PUT — which is why there is no per-row CRUD here. Publishing is its
 * own call so saving a draft can never put it live.
 */

export interface AboutTranslation {
  title: string | null;
  description: string | null;
  links_title: string | null;
}

export interface AboutBlockTranslation {
  title: string | null;
  body: string | null;
}

export interface AboutBlock {
  id: number;
  block_key: string;
  display_order: number;
  az: AboutBlockTranslation;
  en: AboutBlockTranslation;
}

export interface AboutLink {
  id: number;
  url: string | null;
  display_order: number;
  az: { label: string | null };
  en: { label: string | null };
}

export interface AboutPageDetail {
  id: number;
  page_key: string;
  slug_az: string | null;
  slug_en: string | null;
  is_active: boolean;
  az: AboutTranslation;
  en: AboutTranslation;
  blocks: AboutBlock[];
  links: AboutLink[];
  updated_at: string | null;
}

/** Request body for the whole-page save. */
export interface AboutPagePayload {
  slug_az?: string;
  slug_en?: string;
  az?: Partial<AboutTranslation>;
  en?: Partial<AboutTranslation>;
  blocks?: Array<{
    block_key: string;
    az: Partial<AboutBlockTranslation>;
    en: Partial<AboutBlockTranslation>;
  }>;
  links?: Array<{
    url: string;
    az: { label: string };
    en: { label: string };
  }>;
}

const BASE = "/api/about";

export const getAboutPage = async (pageKey: string) => {
  try {
    const response = await apiClient.get(`${BASE}/admin/pages/${pageKey}`);
    if (response.data?.status_code === 200) {
      return response.data.page as AboutPageDetail;
    }
    // A 404 means the row was never seeded — a different problem from the API
    // being unreachable, and the screen says so.
    return response.data?.status_code === 404 ? ("NOT FOUND" as const) : ("ERROR" as const);
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return status === 404 ? ("NOT FOUND" as const) : ("ERROR" as const);
  }
};

export const updateAboutPage = async (pageKey: string, payload: AboutPagePayload) => {
  try {
    const response = await apiClient.put(`${BASE}/admin/pages/${pageKey}`, payload);
    return response.data?.status_code === 200 ? ("SUCCESS" as const) : ("ERROR" as const);
  } catch {
    return "ERROR" as const;
  }
};

export const publishAboutPage = async (pageKey: string, isActive: boolean) => {
  try {
    const response = await apiClient.put(`${BASE}/admin/pages/${pageKey}/publish`, {
      is_active: isActive,
    });
    return response.data?.status_code === 200 ? ("SUCCESS" as const) : ("ERROR" as const);
  } catch {
    return "ERROR" as const;
  }
};
