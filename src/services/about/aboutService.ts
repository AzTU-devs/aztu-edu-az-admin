import apiClient from "../../util/apiClient";

/**
 * The About-page CMS ("Haqqımızda" dropdown on the public site).
 *
 * A page is an ordered list of typed *sections*; a section owns ordered *items*
 * — or, on the leadership pages, *people*. `section_type` is what the editor
 * switches on to decide which fields a row actually has, so the same generic
 * screen renders a timeline, a policy library and a vice-rector list.
 *
 * Every mutation is scoped to one row. Nothing here replaces a whole page.
 */

const ABOUT_BASE = "/api/about";

export type Lang = "az" | "en";

/** Every block shape the /about screens use. Keep in sync with the backend. */
export type SectionType =
  | "paragraphs"
  | "list"
  | "stats"
  | "timeline"
  | "pillars"
  | "people"
  | "table"
  | "documents"
  | "links"
  | "facts"
  | "contact"
  | "video"
  | "quote"
  | "gallery"
  | "ranking_systems"
  | "ranking_positions"
  | "group_list"
  | "cards";

export interface AboutPageTranslation {
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  breadcrumb: string | null;
  intro: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export interface AboutSectionTranslation {
  title: string | null;
  subtitle: string | null;
  description: string | null;
  body_html: string | null;
  footer: string | null;
  note: string | null;
  cta_label: string | null;
  pdf_url: string | null;
  headers: string[] | null;
}

export interface AboutItemTranslation {
  title: string | null;
  subtitle: string | null;
  description: string | null;
  label: string | null;
  value_text: string | null;
  caption: string | null;
  link_label: string | null;
  file_url: string | null;
  extra: unknown;
}

export interface AboutPersonTranslation {
  full_name: string | null;
  degree: string | null;
  position: string | null;
  office: string | null;
  hours: string | null;
  bio_html: string | null;
  achievements: string | null;
  research_interests: string | null;
}

export interface AboutEducationTranslation {
  degree: string | null;
  institution: string | null;
}

export interface AboutEducation {
  id: number;
  period: string | null;
  display_order: number;
  az: AboutEducationTranslation;
  en: AboutEducationTranslation;
}

export interface AboutItem {
  id: number;
  display_order: number;
  item_key: string | null;
  is_active: boolean;
  image_url: string | null;
  link_url: string | null;
  pdf_url: string | null;
  email: string | null;
  phone: string | null;
  icon: string | null;
  slug: string | null;
  year: string | null;
  num: string | null;
  value: string | null;
  extra: unknown;
  az: AboutItemTranslation;
  en: AboutItemTranslation;
}

export interface AboutPerson {
  id: number;
  display_order: number;
  is_active: boolean;
  slug: string | null;
  image_url: string | null;
  email: string | null;
  phone: string | null;
  phone_internal: string | null;
  room_number: string | null;
  az: AboutPersonTranslation;
  en: AboutPersonTranslation;
  educations: AboutEducation[];
}

export interface AboutSection {
  id: number;
  section_key: string;
  section_type: SectionType;
  display_order: number;
  is_active: boolean;
  image_url: string | null;
  link_url: string | null;
  pdf_url: string | null;
  video_url: string | null;
  icon: string | null;
  extra: unknown;
  az: AboutSectionTranslation;
  en: AboutSectionTranslation;
  items: AboutItem[];
  people: AboutPerson[];
}

export interface AboutPageDetail {
  id: number;
  page_key: string;
  group_key: string;
  template: string;
  slug_az: string | null;
  slug_en: string | null;
  display_order: number;
  is_active: boolean;
  hero_image: string | null;
  hero_video_url: string | null;
  cover_image: string | null;
  pdf_url: string | null;
  pdf_filename: string | null;
  website_url: string | null;
  video_url: string | null;
  az: AboutPageTranslation;
  en: AboutPageTranslation;
  sections: AboutSection[];
  created_at: string | null;
  updated_at: string | null;
}

export interface AboutPageListItem {
  id: number;
  page_key: string;
  group_key: string;
  template: string;
  slug_az: string | null;
  slug_en: string | null;
  display_order: number;
  is_active: boolean;
  title_az: string | null;
  title_en: string | null;
  section_count: number;
  updated_at: string | null;
}

export type MutateResult = "SUCCESS" | "NOT FOUND" | "ERROR";
export type CreateResult = { status: "SUCCESS"; id: number } | { status: "ERROR" };

/** Payload halves. Every field is optional — the API applies only what is sent. */
export type AboutPagePayload = Partial<
  Omit<AboutPageDetail, "id" | "page_key" | "sections" | "is_active" | "az" | "en" | "created_at" | "updated_at">
> & { az?: Partial<AboutPageTranslation>; en?: Partial<AboutPageTranslation> };

export type AboutSectionPayload = Partial<
  Omit<AboutSection, "id" | "az" | "en" | "items" | "people">
> & { az?: Partial<AboutSectionTranslation>; en?: Partial<AboutSectionTranslation> };

export type AboutItemPayload = Partial<Omit<AboutItem, "id" | "az" | "en">> & {
  az?: Partial<AboutItemTranslation>;
  en?: Partial<AboutItemTranslation>;
};

export type AboutPersonPayload = Partial<
  Omit<AboutPerson, "id" | "az" | "en" | "educations">
> & {
  az?: Partial<AboutPersonTranslation>;
  en?: Partial<AboutPersonTranslation>;
  educations?: Array<{
    period?: string | null;
    display_order?: number;
    az?: Partial<AboutEducationTranslation>;
    en?: Partial<AboutEducationTranslation>;
  }>;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/** The API answers `{status_code}` in the body; 2xx alone is not success. */
const isOk = (data: unknown, ...codes: number[]): boolean => {
  const code = (data as { status_code?: number } | null)?.status_code;
  return code !== undefined && codes.includes(code);
};

const mutate = async (
  run: () => Promise<{ data?: unknown }>,
  okCodes: number[] = [200, 201]
): Promise<MutateResult> => {
  try {
    const response = await run();
    if (isOk(response.data, ...okCodes)) return "SUCCESS";
    if (isOk(response.data, 404)) return "NOT FOUND";
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

const create = async (run: () => Promise<{ data?: unknown }>): Promise<CreateResult> => {
  try {
    const response = await run();
    const body = response.data as { status_code?: number; id?: number } | null;
    if (body?.status_code === 201 && typeof body.id === "number") {
      return { status: "SUCCESS", id: body.id };
    }
    return { status: "ERROR" };
  } catch {
    return { status: "ERROR" };
  }
};

const upload = async (url: string, field: string, file: File): Promise<MutateResult> => {
  try {
    const form = new FormData();
    form.append(field, file);
    const response = await apiClient.put(url, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return isOk(response.data, 200) ? "SUCCESS" : "ERROR";
  } catch {
    return "ERROR";
  }
};

// ── Pages ──────────────────────────────────────────────────────────────────────

export const getAboutPages = async (): Promise<AboutPageListItem[] | "ERROR"> => {
  try {
    const response = await apiClient.get(`${ABOUT_BASE}/admin/pages`);
    if (isOk(response.data, 200)) {
      return (response.data.pages ?? []) as AboutPageListItem[];
    }
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const getAboutPage = async (
  pageKey: string
): Promise<AboutPageDetail | "NOT FOUND" | "ERROR"> => {
  try {
    const response = await apiClient.get(`${ABOUT_BASE}/admin/pages/${pageKey}`);
    if (isOk(response.data, 200)) return response.data.page as AboutPageDetail;
    if (isOk(response.data, 404)) return "NOT FOUND";
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updateAboutPage = (pageKey: string, payload: AboutPagePayload) =>
  mutate(() => apiClient.put(`${ABOUT_BASE}/admin/pages/${pageKey}`, payload));

/**
 * Publishing is deliberately not part of `updateAboutPage`: it carries its own
 * permission so that saving a half-written paragraph can never push a page live.
 */
export const publishAboutPage = (pageKey: string, isActive: boolean) =>
  mutate(() => apiClient.put(`${ABOUT_BASE}/admin/pages/${pageKey}/publish`, { is_active: isActive }));

export const deleteAboutPage = (pageKey: string) =>
  mutate(() => apiClient.delete(`${ABOUT_BASE}/admin/pages/${pageKey}`));

export const uploadAboutPageImage = async (
  pageKey: string,
  file: File,
  field: "hero_image" | "cover_image" = "hero_image"
): Promise<MutateResult> => {
  try {
    const form = new FormData();
    form.append("image", file);
    form.append("field", field);
    const response = await apiClient.put(`${ABOUT_BASE}/admin/pages/${pageKey}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return isOk(response.data, 200) ? "SUCCESS" : "ERROR";
  } catch {
    return "ERROR";
  }
};

export const uploadAboutPageFile = (pageKey: string, file: File) =>
  upload(`${ABOUT_BASE}/admin/pages/${pageKey}/file`, "file", file);

// ── Sections ───────────────────────────────────────────────────────────────────

export const createAboutSection = (pageKey: string, payload: AboutSectionPayload) =>
  create(() => apiClient.post(`${ABOUT_BASE}/admin/pages/${pageKey}/sections`, payload));

export const updateAboutSection = (sectionId: number, payload: AboutSectionPayload) =>
  mutate(() => apiClient.put(`${ABOUT_BASE}/admin/sections/${sectionId}`, payload));

export const deleteAboutSection = (sectionId: number) =>
  mutate(() => apiClient.delete(`${ABOUT_BASE}/admin/sections/${sectionId}`));

export const reorderAboutSections = (pageKey: string, ids: number[]) =>
  mutate(() => apiClient.put(`${ABOUT_BASE}/admin/pages/${pageKey}/sections/order`, { ids }));

// ── Items ──────────────────────────────────────────────────────────────────────

export const createAboutItem = (sectionId: number, payload: AboutItemPayload) =>
  create(() => apiClient.post(`${ABOUT_BASE}/admin/sections/${sectionId}/items`, payload));

export const updateAboutItem = (itemId: number, payload: AboutItemPayload) =>
  mutate(() => apiClient.put(`${ABOUT_BASE}/admin/items/${itemId}`, payload));

export const deleteAboutItem = (itemId: number) =>
  mutate(() => apiClient.delete(`${ABOUT_BASE}/admin/items/${itemId}`));

export const reorderAboutItems = (sectionId: number, ids: number[]) =>
  mutate(() => apiClient.put(`${ABOUT_BASE}/admin/sections/${sectionId}/items/order`, { ids }));

export const uploadAboutItemImage = (itemId: number, file: File) =>
  upload(`${ABOUT_BASE}/admin/items/${itemId}/image`, "image", file);

/** Omit `lang` for a language-neutral document; pass it for an AZ/EN pair. */
export const uploadAboutItemFile = (itemId: number, file: File, lang?: Lang) =>
  upload(
    `${ABOUT_BASE}/admin/items/${itemId}/file${lang ? `?lang=${lang}` : ""}`,
    "file",
    file
  );

// ── People ─────────────────────────────────────────────────────────────────────

export const createAboutPerson = (sectionId: number, payload: AboutPersonPayload) =>
  create(() => apiClient.post(`${ABOUT_BASE}/admin/sections/${sectionId}/people`, payload));

export const updateAboutPerson = (personId: number, payload: AboutPersonPayload) =>
  mutate(() => apiClient.put(`${ABOUT_BASE}/admin/people/${personId}`, payload));

export const deleteAboutPerson = (personId: number) =>
  mutate(() => apiClient.delete(`${ABOUT_BASE}/admin/people/${personId}`));

export const reorderAboutPeople = (sectionId: number, ids: number[]) =>
  mutate(() => apiClient.put(`${ABOUT_BASE}/admin/sections/${sectionId}/people/order`, { ids }));

export const uploadAboutPersonImage = (personId: number, file: File) =>
  upload(`${ABOUT_BASE}/admin/people/${personId}/image`, "image", file);
