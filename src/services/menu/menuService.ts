import apiClient from "../../util/apiClient";

// ============================================================
// TYPES
// ============================================================

export interface BiLang {
  az: string;
  en: string;
}

// --- HEADER ---
export interface AdminMenuHeader {
  id: number;
  image_url: string | null;
  display_order: number;
  title: string;
  slug: string;
  direct_url: string | null;
  items?: AdminMenuHeaderItem[];
}

export interface AdminMenuHeaderItem {
  id: number;
  header_id: number;
  display_order: number;
  title: string;
  slug: string | null;
  direct_url: string | null;
  sub_items?: AdminMenuHeaderSubItem[];
}

export interface AdminMenuHeaderSubItem {
  id: number;
  item_id: number;
  display_order: number;
  title: string;
  slug: string;
  direct_url: string;
}

// --- FOOTER ---
export interface AdminFooterColumn {
  id: number;
  display_order: number;
  title: BiLang;
  links?: AdminFooterLink[];
}

export interface AdminFooterLink {
  id: number;
  column_id: number;
  url: string;
  display_order: number;
  label: BiLang;
}

export interface AdminPartnerLogo {
  id: number;
  label: string;
  image_url: string;
  url: string;
  display_order: number;
}

export interface AdminQuickIcon {
  id: number;
  icon: string;
  url: string;
  display_order: number;
  label: BiLang;
}

// --- SHARED ---
export interface AdminSocialLink {
  id: number;
  platform: "facebook" | "instagram" | "linkedin" | "youtube";
  url: string;
  context: "footer" | "quick" | "both";
  display_order: number;
}

export interface AdminContact {
  id: number;
  context: "footer" | "quick";
  email: string;
  phones: string[];
  address?: BiLang;
}

// --- QUICK MENU ---
export interface AdminQuickLeftItem {
  id: number;
  url: string;
  display_order: number;
  label: BiLang;
}

export interface AdminQuickSection {
  id: number;
  section_key: string;
  display_order: number;
  title: BiLang;
  items?: AdminQuickSectionItem[];
}

export interface AdminQuickSectionItem {
  id: number;
  section_id: number;
  url: string;
  display_order: number;
  label: BiLang;
}

// ============================================================
// HEADER - GET
// ============================================================

export const getAdminHeader = async (): Promise<AdminHeaderSection[] | "ERROR"> => {
  try {
    const res = await apiClient.get("/api/menu/header?lang=az");
    if (res.data.status_code === 200) {
      return res.data.data.sections as AdminHeaderSection[];
    }
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

// ============================================================
// HEADER - SECTION CRUD
// ============================================================

export const createHeaderSection = async (payload: {
  section_key: string;
  image: File;
  display_order: number;
  label_az: string;
  label_en: string;
  base_path_az: string;
  base_path_en: string;
  direct_url?: string;
}): Promise<{ id: number } | "ERROR" | "CONFLICT"> => {
  try {
    const formData = new FormData();
    formData.append("section_key", payload.section_key);
    formData.append("display_order", String(payload.display_order));
    formData.append("label_az", payload.label_az);
    formData.append("label_en", payload.label_en);
    formData.append("base_path_az", payload.base_path_az);
    formData.append("base_path_en", payload.base_path_en);
    formData.append("image", payload.image);
    if (payload.direct_url !== undefined) formData.append("direct_url", payload.direct_url);
    const res = await apiClient.post("/api/menu/header/section", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.status_code === 201) return { id: res.data.id };
    if (res.data.status_code === 409) return "CONFLICT";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 409) return "CONFLICT";
    return "ERROR";
  }
};

export const updateHeaderSection = async (
  id: number,
  payload: Partial<{
    display_order: number;
    label_az: string;
    label_en: string;
    base_path_az: string;
    base_path_en: string;
    image: File;
    direct_url: string;
  }>
): Promise<"SUCCESS" | "ERROR" | "NOT FOUND"> => {
  try {
    const formData = new FormData();
    if (payload.display_order !== undefined) formData.append("display_order", String(payload.display_order));
    if (payload.label_az !== undefined) formData.append("label_az", payload.label_az);
    if (payload.label_en !== undefined) formData.append("label_en", payload.label_en);
    if (payload.base_path_az !== undefined) formData.append("base_path_az", payload.base_path_az);
    if (payload.base_path_en !== undefined) formData.append("base_path_en", payload.base_path_en);
    if (payload.image) formData.append("image", payload.image);
    if (payload.direct_url !== undefined) formData.append("direct_url", payload.direct_url);
    const res = await apiClient.put(`/api/menu/header/section/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteHeaderSection = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/header/section/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

// ============================================================
// HEADER - ITEM CRUD
// ============================================================

export const createHeaderItem = async (payload: {
  section_id: number;
  item_type: "link" | "subheader";
  slug?: string | null;
  display_order: number;
  title: BiLang;
}): Promise<{ id: number } | "ERROR"> => {
  try {
    const res = await apiClient.post("/api/menu/header/item", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updateHeaderItem = async (
  id: number,
  payload: Partial<{ item_type: "link" | "subheader"; slug: string | null; display_order: number; title: Partial<BiLang> }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/header/item/${id}`, payload);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteHeaderItem = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/header/item/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

// ============================================================
// HEADER - SUB-ITEM CRUD
// ============================================================

export const createHeaderSubItem = async (payload: {
  item_id: number;
  slug: string;
  display_order: number;
  title: BiLang;
}): Promise<{ id: number } | "ERROR"> => {
  try {
    const res = await apiClient.post("/api/menu/header/sub-item", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updateHeaderSubItem = async (
  id: number,
  payload: Partial<{ slug: string; display_order: number; title: Partial<BiLang> }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/header/sub-item/${id}`, payload);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteHeaderSubItem = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/header/sub-item/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

// ============================================================
// FOOTER - GET
// ============================================================

export interface AdminFooterData {
  columns: AdminFooterColumn[];
  partner_logos: AdminPartnerLogo[];
  quick_icons: AdminQuickIcon[];
}

export const getAdminFooter = async (): Promise<AdminFooterData | "ERROR"> => {
  try {
    const res = await apiClient.get("/api/menu/footer?lang=az");
    if (res.data.status_code === 200) {
      return {
        columns: res.data.data.columns as AdminFooterColumn[],
        partner_logos: res.data.data.partner_logos as AdminPartnerLogo[],
        quick_icons: res.data.data.quick_icons as AdminQuickIcon[],
      };
    }
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

// ============================================================
// FOOTER - COLUMN CRUD
// ============================================================

export const createFooterColumn = async (payload: {
  display_order: number;
  title: BiLang;
}): Promise<{ id: number } | "ERROR"> => {
  try {
    const res = await apiClient.post("/api/menu/footer/column", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updateFooterColumn = async (
  id: number,
  payload: Partial<{ display_order: number; title: Partial<BiLang> }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/footer/column/${id}`, payload);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteFooterColumn = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/footer/column/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

// ============================================================
// FOOTER - LINK CRUD
// ============================================================

export const createFooterLink = async (payload: {
  column_id: number;
  url: string;
  display_order: number;
  label: BiLang;
}): Promise<{ id: number } | "ERROR"> => {
  try {
    const res = await apiClient.post("/api/menu/footer/link", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updateFooterLink = async (
  id: number,
  payload: Partial<{ url: string; display_order: number; label: Partial<BiLang> }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/footer/link/${id}`, payload);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteFooterLink = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/footer/link/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

// ============================================================
// FOOTER - PARTNER LOGO CRUD
// ============================================================

export const createPartnerLogo = async (payload: {
  label: string;
  image_url: string;
  url: string;
  display_order: number;
}): Promise<{ id: number } | "ERROR"> => {
  try {
    const res = await apiClient.post("/api/menu/footer/partner-logo", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updatePartnerLogo = async (
  id: number,
  payload: Partial<{ label: string; image_url: string; url: string; display_order: number }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/footer/partner-logo/${id}`, payload);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deletePartnerLogo = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/footer/partner-logo/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

// ============================================================
// FOOTER - QUICK ICON CRUD
// ============================================================

export const createQuickIcon = async (payload: {
  icon: string;
  url: string;
  display_order: number;
  label: BiLang;
}): Promise<{ id: number } | "ERROR"> => {
  try {
    const res = await apiClient.post("/api/menu/footer/quick-icon", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updateQuickIcon = async (
  id: number,
  payload: Partial<{ icon: string; url: string; display_order: number; label: Partial<BiLang> }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/footer/quick-icon/${id}`, payload);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteQuickIcon = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/footer/quick-icon/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

// ============================================================
// SHARED - SOCIAL LINKS
// ============================================================

export const getAdminSocialLinks = async (): Promise<AdminSocialLink[] | "ERROR"> => {
  try {
    const res = await apiClient.get("/api/menu/footer?lang=az");
    if (res.data.status_code === 200) {
      return res.data.data.social_links as AdminSocialLink[];
    }
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const createSocialLink = async (payload: {
  platform: string;
  url: string;
  context: string;
  display_order: number;
}): Promise<{ id: number } | "ERROR"> => {
  try {
    const res = await apiClient.post("/api/menu/social-link", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updateSocialLink = async (
  id: number,
  payload: Partial<{ platform: string; url: string; context: string; display_order: number }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/social-link/${id}`, payload);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteSocialLink = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/social-link/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

// ============================================================
// SHARED - CONTACT
// ============================================================

export const getAdminContacts = async (): Promise<AdminContact[] | "ERROR"> => {
  try {
    const [footerRes, quickRes] = await Promise.all([
      apiClient.get("/api/menu/footer?lang=az"),
      apiClient.get("/api/menu/quick?lang=az"),
    ]);
    const contacts: AdminContact[] = [];
    if (footerRes.data.status_code === 200 && footerRes.data.data.contact) {
      contacts.push({ ...footerRes.data.data.contact, context: "footer" } as AdminContact);
    }
    if (quickRes.data.status_code === 200 && quickRes.data.data.contact) {
      contacts.push({ ...quickRes.data.data.contact, context: "quick" } as AdminContact);
    }
    return contacts;
  } catch {
    return "ERROR";
  }
};

export const createContact = async (payload: {
  context: "footer" | "quick";
  email: string;
  phones: string[];
  address?: BiLang;
}): Promise<{ id: number } | "ERROR"> => {
  try {
    const res = await apiClient.post("/api/menu/contact", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updateContact = async (
  id: number,
  payload: Partial<{ email: string; phones: string[]; address: Partial<BiLang> }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/contact/${id}`, payload);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteContact = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/contact/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

// ============================================================
// QUICK MENU - GET
// ============================================================

export interface AdminQuickMenuData {
  left_items: AdminQuickLeftItem[];
  sections: AdminQuickSection[];
  social_links: AdminSocialLink[];
}

export const getAdminQuickMenu = async (): Promise<AdminQuickMenuData | "ERROR"> => {
  try {
    const res = await apiClient.get("/api/menu/quick?lang=az");
    if (res.data.status_code === 200) {
      return {
        left_items: res.data.data.left_items as AdminQuickLeftItem[],
        sections: res.data.data.right_sections as AdminQuickSection[],
        social_links: res.data.data.social_links as AdminSocialLink[],
      };
    }
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

// ============================================================
// QUICK MENU - LEFT ITEM CRUD
// ============================================================

export const createQuickLeftItem = async (payload: {
  url: string;
  display_order: number;
  label: BiLang;
}): Promise<{ id: number } | "ERROR"> => {
  try {
    const res = await apiClient.post("/api/menu/quick/left-item", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updateQuickLeftItem = async (
  id: number,
  payload: Partial<{ url: string; display_order: number; label: Partial<BiLang> }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/quick/left-item/${id}`, payload);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteQuickLeftItem = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/quick/left-item/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

// ============================================================
// QUICK MENU - SECTION CRUD
// ============================================================

export const createQuickSection = async (payload: {
  section_key: string;
  display_order: number;
  title: BiLang;
}): Promise<{ id: number } | "ERROR" | "CONFLICT"> => {
  try {
    const res = await apiClient.post("/api/menu/quick/section", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    if (res.data.status_code === 409) return "CONFLICT";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 409) return "CONFLICT";
    return "ERROR";
  }
};

export const updateQuickSection = async (
  id: number,
  payload: Partial<{ display_order: number; title: Partial<BiLang> }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/quick/section/${id}`, payload);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteQuickSection = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/quick/section/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

// ============================================================
// QUICK MENU - SECTION ITEM CRUD
// ============================================================

export const createQuickSectionItem = async (payload: {
  section_id: number;
  url: string;
  display_order: number;
  label: BiLang;
}): Promise<{ id: number } | "ERROR"> => {
  try {
    const res = await apiClient.post("/api/menu/quick/section-item", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updateQuickSectionItem = async (
  id: number,
  payload: Partial<{ url: string; display_order: number; label: Partial<BiLang> }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/quick/section-item/${id}`, payload);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};

export const deleteQuickSectionItem = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/quick/section-item/${id}`);
    if (res.data.status_code === 200) return "SUCCESS";
    if (res.data.status_code === 404) return "NOT FOUND";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 404) return "NOT FOUND";
    return "ERROR";
  }
};
