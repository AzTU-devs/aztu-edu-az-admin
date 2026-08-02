import apiClient from "../../util/apiClient";

/**
 * Offices & Centres ("Ofis və Mərkəzlər").
 *
 * A creatable CRUD entity: create mints the slugs from the name, then the whole
 * office saves as one document (like the About pages). Publishing is its own
 * call so saving a draft can never put it live.
 */

const BASE = "/api/office/admin";

export interface OfficeListItem {
  id: number;
  slug_az: string | null;
  slug_en: string | null;
  is_active: boolean;
  name_az: string | null;
  name_en: string | null;
  updated_at: string | null;
}

export interface OfficeTranslation {
  name: string | null;
  short_description: string | null;
  about_title: string | null;
  about_text: string | null;
  goal_title: string | null;
  goals: string[] | null;
  functions_title: string | null;
  director_title: string | null;
  director_name: string | null;
  director_surname: string | null;
  director_position: string | null;
  director_bio: string | null;
  director_room: string | null;
  director_work_hours: string | null;
  staff_title: string | null;
  contact_room: string | null;
  contact_work_hours: string | null;
}

export interface OfficeFunction {
  id: number;
  az: { title: string | null; description: string | null };
  en: { title: string | null; description: string | null };
}

export interface OfficeEducation {
  id: number;
  start_year: string | null;
  end_year: string | null;
  az: { degree: string | null; university: string | null };
  en: { degree: string | null; university: string | null };
}

export interface OfficeStaff {
  id: number;
  phone: string | null;
  phone_code: string | null;
  email: string | null;
  image_url: string | null;
  az: { name: string | null; surname: string | null; duty: string | null };
  en: { name: string | null; surname: string | null; duty: string | null };
}

export interface OfficeDetail {
  id: number;
  slug_az: string | null;
  slug_en: string | null;
  display_order: number;
  is_active: boolean;
  director_phone: string | null;
  director_phone_code: string | null;
  director_email: string | null;
  director_image_url: string | null;
  contact_phone: string | null;
  contact_phone_code: string | null;
  contact_email: string | null;
  az: OfficeTranslation;
  en: OfficeTranslation;
  functions: OfficeFunction[];
  educations: OfficeEducation[];
  staff: OfficeStaff[];
  updated_at: string | null;
}

/** Request body for the whole-office save. */
export interface OfficeUpdatePayload {
  director_phone?: string;
  director_phone_code?: string;
  director_email?: string;
  director_image_url?: string;
  contact_phone?: string;
  contact_phone_code?: string;
  contact_email?: string;
  az?: Partial<OfficeTranslation>;
  en?: Partial<OfficeTranslation>;
  functions?: Array<{
    az: { title: string; description: string };
    en: { title: string; description: string };
  }>;
  educations?: Array<{
    start_year: string;
    end_year: string;
    az: { degree: string; university: string };
    en: { degree: string; university: string };
  }>;
  staff?: Array<{
    phone: string;
    phone_code: string;
    email: string;
    image_url: string;
    az: { name: string; surname: string; duty: string };
    en: { name: string; surname: string; duty: string };
  }>;
}

export const getOffices = async () => {
  try {
    const response = await apiClient.get(`${BASE}/offices`);
    if (response.data?.status_code === 200) {
      return response.data.offices as OfficeListItem[];
    }
    return "ERROR" as const;
  } catch {
    return "ERROR" as const;
  }
};

export const getOffice = async (id: number | string) => {
  try {
    const response = await apiClient.get(`${BASE}/offices/${id}`);
    if (response.data?.status_code === 200) {
      return response.data.office as OfficeDetail;
    }
    return response.data?.status_code === 404 ? ("NOT FOUND" as const) : ("ERROR" as const);
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return status === 404 ? ("NOT FOUND" as const) : ("ERROR" as const);
  }
};

export const createOffice = async (payload: { name_az: string; name_en: string }) => {
  try {
    const response = await apiClient.post(`${BASE}/offices`, payload);
    if (response.data?.status_code === 201 && response.data?.data?.id) {
      return { status: "SUCCESS" as const, id: response.data.data.id as number };
    }
    return { status: "ERROR" as const };
  } catch {
    return { status: "ERROR" as const };
  }
};

export const updateOffice = async (id: number | string, payload: OfficeUpdatePayload) => {
  try {
    const response = await apiClient.put(`${BASE}/offices/${id}`, payload);
    return response.data?.status_code === 200 ? ("SUCCESS" as const) : ("ERROR" as const);
  } catch {
    return "ERROR" as const;
  }
};

export const deleteOffice = async (id: number | string) => {
  try {
    const response = await apiClient.delete(`${BASE}/offices/${id}`);
    return response.data?.status_code === 200 ? ("SUCCESS" as const) : ("ERROR" as const);
  } catch {
    return "ERROR" as const;
  }
};

export const publishOffice = async (id: number | string, isActive: boolean) => {
  try {
    const response = await apiClient.put(`${BASE}/offices/${id}/publish`, {
      is_active: isActive,
    });
    return response.data?.status_code === 200 ? ("SUCCESS" as const) : ("ERROR" as const);
  } catch {
    return "ERROR" as const;
  }
};

/** Uploads one image (director portrait or a staff photo) and returns its path. */
export const uploadOfficeImage = async (id: number | string, file: File) => {
  try {
    const body = new FormData();
    body.append("image", file);
    const response = await apiClient.put(`${BASE}/offices/${id}/image`, body);
    if (response.data?.status_code === 200 && typeof response.data?.path === "string") {
      return { status: "SUCCESS" as const, path: response.data.path as string };
    }
    return { status: "ERROR" as const };
  } catch {
    return { status: "ERROR" as const };
  }
};
