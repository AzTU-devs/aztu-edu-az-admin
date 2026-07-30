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
  document_label: string | null;
  pillars_title: string | null;
  /** Rector page: academic degree, title, message (rich text) and biography. */
  degree: string | null;
  position: string | null;
  message: string | null;
  about: string | null;
  /** Vice-rector page: category line, the "Executive Leadership" heading and its lead. */
  domains: string | null;
  section_title: string | null;
  section_body: string | null;
  /** Scientific-board page: the heading above the councils list. */
  councils_title: string | null;
}

/** One picture in the rector's gallery. */
export interface AboutImage {
  id: number;
  image_url: string | null;
  display_order: number;
}

/**
 * A person card. Shared across pages that list people: vice-rectors (name,
 * degree, position, bio + contact), former rectors (name, surname, duty years,
 * bio) and a partner institution's director (photo, name, surname, degree).
 */
export interface AboutPerson {
  id: number;
  email: string | null;
  phone: string | null;
  phone_code: string | null;
  image_url: string | null;
  /** Former-rectors page: the years in office. */
  year_start: string | null;
  year_end: string | null;
  az: {
    name: string | null;
    surname: string | null;
    degree: string | null;
    position: string | null;
    bio: string | null;
  };
  en: {
    name: string | null;
    surname: string | null;
    degree: string | null;
    position: string | null;
    bio: string | null;
  };
}

/** One person on a council — a member or a secretariat member. */
export interface AboutCouncilMember {
  id: number;
  az: { name: string | null; surname: string | null; position: string | null };
  en: { name: string | null; surname: string | null; position: string | null };
}

/** One council on the scientific-board page, with its two rosters. */
export interface AboutCouncil {
  id: number;
  az: { name: string | null };
  en: { name: string | null };
  members: AboutCouncilMember[];
  secretaries: AboutCouncilMember[];
}

/** A document category on a regulatory-documents page. */
export interface AboutDocCategory {
  id: number;
  category_key: string;
  az: { name: string | null };
  en: { name: string | null };
}

/** One downloadable document card. */
export interface AboutDocument {
  id: number;
  /** References a category's category_key on the same page, or null. */
  category_key: string | null;
  /** An uploaded file's path or a pasted URL — any format. */
  file_url: string | null;
  az: { name: string | null };
  en: { name: string | null };
}

/** One numbered card under "Strateji Sütunlar". */
export interface AboutPillar {
  id: number;
  az: { title: string | null; description: string | null; tags: string[] | null };
  en: { title: string | null; description: string | null; tags: string[] | null };
}

/** A heading plus one-line entries — the corporate values and the KPIs. */
export interface AboutList {
  id: number;
  list_key: string;
  /** bullet | number */
  style: string;
  az: { title: string | null; items: string[] | null };
  en: { title: string | null; items: string[] | null };
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

/** One year on the history timeline. */
export interface AboutMilestone {
  id: number;
  /** Free text — "1950", "1887-1905", "Bu gün". */
  year: string | null;
  az: { title: string | null; description: string | null };
  en: { title: string | null; description: string | null };
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
  /** Which form to show: statements | timeline. */
  template: string;
  slug_az: string | null;
  slug_en: string | null;
  /** An uploaded file's path or a pasted URL — the page treats them alike. */
  document_url: string | null;
  /** Rector page, language-neutral. */
  experience: string | null;
  email: string | null;
  /** The rector's portrait — an uploaded file's path or a pasted URL. */
  image_url: string | null;
  is_active: boolean;
  az: AboutTranslation;
  en: AboutTranslation;
  blocks: AboutBlock[];
  links: AboutLink[];
  milestones: AboutMilestone[];
  pillars: AboutPillar[];
  lists: AboutList[];
  /** Rector page: the gallery strip. */
  images: AboutImage[];
  /** Vice-rector page: the person cards. */
  persons: AboutPerson[];
  /** Scientific-board page: the councils, each with its members and secretariat. */
  councils: AboutCouncil[];
  /** Regulatory-documents page: the categories and the document cards. */
  doc_categories: AboutDocCategory[];
  documents: AboutDocument[];
  updated_at: string | null;
}

/** Request body for the whole-page save. */
export interface AboutPagePayload {
  slug_az?: string;
  slug_en?: string;
  document_url?: string;
  /** Rector page, language-neutral. */
  experience?: string;
  email?: string;
  image_url?: string;
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
  milestones?: Array<{
    year: string;
    az: { title: string; description: string };
    en: { title: string; description: string };
  }>;
  pillars?: Array<{
    az: { title: string; description: string; tags: string[] };
    en: { title: string; description: string; tags: string[] };
  }>;
  lists?: Array<{
    list_key: string;
    style: string;
    az: { title: string; items: string[] };
    en: { title: string; items: string[] };
  }>;
  /** Rector page: the gallery strip, sent whole. */
  images?: Array<{ image_url: string }>;
  /** Person cards — vice-rectors, former rectors, or a partner director. */
  persons?: Array<{
    email: string;
    phone: string;
    phone_code: string;
    image_url: string;
    year_start: string;
    year_end: string;
    az: { name: string; surname: string; degree: string; position: string; bio: string };
    en: { name: string; surname: string; degree: string; position: string; bio: string };
  }>;
  /** Scientific-board page: the councils, each with its two rosters, sent whole. */
  councils?: Array<{
    az: { name: string };
    en: { name: string };
    members: Array<{
      az: { name: string; surname: string; position: string };
      en: { name: string; surname: string; position: string };
    }>;
    secretaries: Array<{
      az: { name: string; surname: string; position: string };
      en: { name: string; surname: string; position: string };
    }>;
  }>;
  /** Regulatory-documents page: the categories, sent whole. */
  doc_categories?: Array<{
    category_key: string;
    az: { name: string };
    en: { name: string };
  }>;
  /** Regulatory-documents page: the document cards, sent whole. */
  documents?: Array<{
    category_key: string;
    file_url: string;
    az: { name: string };
    en: { name: string };
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

/** Uploads the plan document and points the page at the stored file. */
export const uploadAboutDocument = async (pageKey: string, file: File) => {
  try {
    const body = new FormData();
    body.append("file", file);
    const response = await apiClient.put(`${BASE}/admin/pages/${pageKey}/document`, body);
    return response.data?.status_code === 200 ? ("SUCCESS" as const) : ("ERROR" as const);
  } catch {
    return "ERROR" as const;
  }
};

/**
 * Uploads one image (the rector's portrait or a gallery photo) and returns its
 * stored path. The endpoint only stores the file — the caller drops the path
 * into `image_url` or the `images` strip and the whole-page save persists it.
 */
export const uploadAboutImage = async (pageKey: string, file: File) => {
  try {
    const body = new FormData();
    body.append("file", file);
    const response = await apiClient.put(`${BASE}/admin/pages/${pageKey}/image`, body);
    if (response.data?.status_code === 200 && typeof response.data?.path === "string") {
      return { status: "SUCCESS" as const, path: response.data.path as string };
    }
    return { status: "ERROR" as const };
  } catch {
    return { status: "ERROR" as const };
  }
};

/**
 * Uploads one document (any supported format) and returns its stored path. Like
 * the image upload, it only stores the file — the caller drops the path into a
 * document card's `file_url` and the whole-page save persists it.
 */
export const uploadAboutFile = async (pageKey: string, file: File) => {
  try {
    const body = new FormData();
    body.append("file", file);
    const response = await apiClient.put(`${BASE}/admin/pages/${pageKey}/file`, body);
    if (response.data?.status_code === 200 && typeof response.data?.path === "string") {
      return { status: "SUCCESS" as const, path: response.data.path as string };
    }
    return { status: "ERROR" as const };
  } catch {
    return { status: "ERROR" as const };
  }
};
