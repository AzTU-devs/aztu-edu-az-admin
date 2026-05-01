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
  title_az?: string;
  title_en?: string;
  slug: string;
  direct_url: string | null;
  has_subitems: boolean;
  is_active: boolean;
  items?: AdminMenuHeaderItem[];
}

export interface AdminMenuHeaderItem {
  id: number;
  header_id: number;
  display_order: number;
  title: string;
  title_az?: string;
  title_en?: string;
  slug: string | null;
  direct_url: string | null;
  has_subitems: boolean;
  is_active: boolean;
  sub_items?: AdminMenuHeaderSubItem[];
  subitems?: AdminMenuHeaderSubItem[];
}

export interface AdminMenuHeaderSubItem {
  id: number;
  item_id: number;
  display_order: number;
  title: string;
  title_az?: string;
  title_en?: string;
  slug: string;
  direct_url: string | null;
  is_active: boolean;
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

export const getMenuHeader = async (lang: string = "az"): Promise<AdminMenuHeader[] | "ERROR"> => {
  try {
    const res = await apiClient.get("/api/menu/header/", {
      headers: { "Accept-Language": lang },
    });
    if (res.data.status_code === 200) {
      return res.data.data as AdminMenuHeader[];
    }
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const getAdminHeader = () => getMenuHeader("az");

// ============================================================
// HEADER - HEADER CRUD
// ============================================================

export const createMenuHeader = async (payload: {
  title_az: string;
  title_en: string;
  display_order: number;
  has_subitems: boolean;
  direct_url?: string;
  image?: File;
}): Promise<{ id: number } | "ERROR"> => {
  try {
    const formData = new FormData();
    formData.append("title_az", payload.title_az);
    formData.append("title_en", payload.title_en);
    formData.append("display_order", String(payload.display_order));
    formData.append("has_subitems", payload.has_subitems ? "1" : "0");
    if (payload.direct_url !== undefined) formData.append("direct_url", payload.direct_url);
    if (payload.image) formData.append("image", payload.image);
    const res = await apiClient.post("/api/menu/header/header/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.status_code === 201) return { id: res.data.id };
    return "ERROR";
  } catch {
    return "ERROR";
  }
};

export const updateMenuHeader = async (
  id: number,
  payload: Partial<{
    title_az: string;
    title_en: string;
    display_order: number;
    has_subitems: boolean;
    direct_url: string;
    is_active: boolean;
    image: File;
  }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const formData = new FormData();
    if (payload.title_az !== undefined) formData.append("title_az", payload.title_az);
    if (payload.title_en !== undefined) formData.append("title_en", payload.title_en);
    if (payload.display_order !== undefined) formData.append("display_order", String(payload.display_order));
    if (payload.has_subitems !== undefined) formData.append("has_subitems", payload.has_subitems ? "1" : "0");
    if (payload.direct_url !== undefined) formData.append("direct_url", payload.direct_url);
    if (payload.is_active !== undefined) formData.append("is_active", payload.is_active ? "1" : "0");
    if (payload.image) formData.append("image", payload.image);
    const res = await apiClient.put(`/api/menu/header/header/${id}/`, formData, {
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

export const deleteMenuHeader = async (id: number): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.delete(`/api/menu/header/header/${id}/`);
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
  header_id: number;
  title_az: string;
  title_en: string;
  display_order: number;
  has_subitems: boolean;
  direct_url?: string | null;
}): Promise<{ id: number } | "ERROR" | "BAD REQUEST"> => {
  try {
    const res = await apiClient.post("/api/menu/header/item/", {
      ...payload,
      has_subitems: payload.has_subitems ? 1 : 0,
    });
    if (res.data.status_code === 201) return { id: res.data.id };
    if (res.data.status_code === 400) return "BAD REQUEST";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 400) return "BAD REQUEST";
    return "ERROR";
  }
};

export const updateHeaderItem = async (
  id: number,
  payload: Partial<{
    title_az: string;
    title_en: string;
    display_order: number;
    has_subitems: boolean;
    direct_url: string | null;
    is_active: boolean;
  }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const body = {
      ...payload,
      has_subitems: payload.has_subitems !== undefined ? (payload.has_subitems ? 1 : 0) : undefined,
      is_active: payload.is_active !== undefined ? (payload.is_active ? 1 : 0) : undefined,
    };
    const res = await apiClient.put(`/api/menu/header/item/${id}/`, body);
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
    const res = await apiClient.delete(`/api/menu/header/item/${id}/`);
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
  title_az: string;
  title_en: string;
  display_order: number;
  direct_url?: string | null;
}): Promise<{ id: number } | "ERROR" | "BAD REQUEST"> => {
  try {
    const res = await apiClient.post("/api/menu/header/subitem/", payload);
    if (res.data.status_code === 201) return { id: res.data.id };
    if (res.data.status_code === 400) return "BAD REQUEST";
    return "ERROR";
  } catch (err: any) {
    if (err.response?.status === 400) return "BAD REQUEST";
    return "ERROR";
  }
};

export const updateHeaderSubItem = async (
  id: number,
  payload: Partial<{
    title_az: string;
    title_en: string;
    display_order: number;
    direct_url: string | null;
    is_active: boolean;
  }>
): Promise<"SUCCESS" | "NOT FOUND" | "ERROR"> => {
  try {
    const res = await apiClient.put(`/api/menu/header/subitem/${id}/`, payload);
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
    const res = await apiClient.delete(`/api/menu/header/subitem/${id}/`);
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
