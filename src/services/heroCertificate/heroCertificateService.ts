import apiClient from "../../util/apiClient";

const HERO_CERTIFICATE_BASE = "/api/hero-certificate";

/** The four ranking families the hero can group certificates by. */
export type HeroCertificateFamily = "world" | "europe" | "subject" | "other";

export const FAMILY_OPTIONS: { value: HeroCertificateFamily; label: string }[] = [
    { value: "world", label: "Dünya" },
    { value: "europe", label: "Avropa" },
    { value: "subject", label: "Fənn üzrə" },
    { value: "other", label: "Digər" },
];

/** One language's worth of certificate copy. All plain text — no rich editor. */
export interface HeroCertificateTranslation {
    title: string;
    kicker: string | null;
    signer: string | null;
}

/** Row shape returned by `GET /public` and `GET /all` — single language, flattened. */
export interface HeroCertificate {
    id: number;
    certificate_id: number;
    rank_label: string;
    family: HeroCertificateFamily | string;
    image: string | null;
    document: string | null;
    external_url: string | null;
    issued_date: string | null;
    display_order: number;
    is_active: boolean;
    title: string | null;
    kicker: string | null;
    signer: string | null;
    created_at: string;
    updated_at?: string | null;
}

/** Shape returned by `GET /{certificate_id}/admin` — both languages, for the edit form. */
export interface HeroCertificateDetail {
    id: number;
    certificate_id: number;
    rank_label: string;
    family: HeroCertificateFamily | string;
    image: string | null;
    document: string | null;
    external_url: string | null;
    issued_date: string | null;
    display_order: number;
    is_active: boolean;
    az: HeroCertificateTranslation;
    en: HeroCertificateTranslation;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface CreateHeroCertificatePayload {
    rank_label: string;
    family: HeroCertificateFamily | string;
    issued_date?: string;
    external_url?: string;
    image?: File | null;
    document?: File | null;
    az_title: string;
    en_title: string;
    az_kicker?: string;
    en_kicker?: string;
    az_signer?: string;
    en_signer?: string;
}

export interface UpdateHeroCertificatePayload extends CreateHeroCertificatePayload {
    certificate_id: number;
    /** Send `true` to drop the stored image; a new `image` upload replaces it instead. */
    remove_image?: boolean;
    /** Send `true` to drop the stored document; a new `document` upload replaces it instead. */
    remove_document?: boolean;
}

export interface ReorderHeroCertificatePayload {
    certificate_id: number;
    new_order: number;
}

export const blankTranslation = (): HeroCertificateTranslation => ({
    title: "",
    kicker: "",
    signer: "",
});

/**
 * Optional multipart fields are omitted when blank rather than sent as "" —
 * the API rejects empty strings on typed optional fields.
 */
const appendOptional = (formData: FormData, key: string, value?: string | null) => {
    const trimmed = value?.trim();
    if (trimmed) formData.append(key, trimmed);
};

const buildCertificateFormData = (payload: CreateHeroCertificatePayload) => {
    const formData = new FormData();

    formData.append("rank_label", payload.rank_label);
    formData.append("family", payload.family);
    appendOptional(formData, "issued_date", payload.issued_date);
    appendOptional(formData, "external_url", payload.external_url);

    if (payload.image) formData.append("image", payload.image);
    if (payload.document) formData.append("document", payload.document);

    formData.append("az_title", payload.az_title);
    formData.append("en_title", payload.en_title);
    appendOptional(formData, "az_kicker", payload.az_kicker);
    appendOptional(formData, "en_kicker", payload.en_kicker);
    appendOptional(formData, "az_signer", payload.az_signer);
    appendOptional(formData, "en_signer", payload.en_signer);

    return formData;
};

export const getHeroCertificates = async (start: number, end: number, lang: string = "az") => {
    try {
        const response = await apiClient.get(
            `${HERO_CERTIFICATE_BASE}/all?start=${start}&end=${end}&lang=${lang}`
        );

        // An empty list comes back as a real 204, which leaves axios with no body —
        // so the status is checked before reaching into `data`.
        if (response.status === 204 || response.data?.status_code === 204) {
            return "NO CONTENT" as const;
        }

        if (response.data?.status_code === 200) {
            return {
                certificates: (response.data.certificates ?? []) as HeroCertificate[],
                total: (response.data.total ?? 0) as number,
            };
        }

        return "ERROR" as const;
    } catch {
        return "ERROR" as const;
    }
};

export const getHeroCertificateDetail = async (certificateId: number) => {
    try {
        const response = await apiClient.get(`${HERO_CERTIFICATE_BASE}/${certificateId}/admin`);

        if (response.data?.status_code === 200) {
            return response.data.certificate as HeroCertificateDetail;
        }

        return "ERROR" as const;
    } catch (err: any) {
        if (err?.response?.status === 404) return "NOT FOUND" as const;
        return "ERROR" as const;
    }
};

export const createHeroCertificate = async (payload: CreateHeroCertificatePayload) => {
    try {
        const formData = buildCertificateFormData(payload);

        const response = await apiClient.post(`${HERO_CERTIFICATE_BASE}/create`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data?.status_code === 201) return "SUCCESS" as const;

        return "ERROR" as const;
    } catch {
        return "ERROR" as const;
    }
};

export const updateHeroCertificate = async (payload: UpdateHeroCertificatePayload) => {
    try {
        const formData = buildCertificateFormData(payload);

        // Uploads are optional on update; omitting one keeps the stored file, so the
        // explicit removal flags are the only way to clear it.
        if (payload.remove_image) formData.append("remove_image", "true");
        if (payload.remove_document) formData.append("remove_document", "true");

        const response = await apiClient.put(
            `${HERO_CERTIFICATE_BASE}/${payload.certificate_id}/update`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.data?.status_code === 200) return "SUCCESS" as const;

        return "ERROR" as const;
    } catch (err: any) {
        if (err?.response?.status === 404) return "NOT FOUND" as const;
        return "ERROR" as const;
    }
};

export const reorderHeroCertificate = async (payload: ReorderHeroCertificatePayload) => {
    try {
        const response = await apiClient.post(`${HERO_CERTIFICATE_BASE}/reorder`, payload);

        if (response.data?.status_code === 200) return "SUCCESS" as const;

        return "ERROR" as const;
    } catch (err: any) {
        if (err?.response?.status === 404) return "NOT FOUND" as const;
        return "ERROR" as const;
    }
};

export const activateHeroCertificate = async (certificateId: number) => {
    try {
        const response = await apiClient.post(
            `${HERO_CERTIFICATE_BASE}/activate?certificate_id=${certificateId}`
        );

        if (response.data?.status_code === 200) return "SUCCESS" as const;

        return "ERROR" as const;
    } catch (err: any) {
        if (err?.response?.status === 404) return "NOT FOUND" as const;
        return "ERROR" as const;
    }
};

export const deactivateHeroCertificate = async (certificateId: number) => {
    try {
        const response = await apiClient.post(
            `${HERO_CERTIFICATE_BASE}/deactivate?certificate_id=${certificateId}`
        );

        if (response.data?.status_code === 200) return "SUCCESS" as const;

        return "ERROR" as const;
    } catch (err: any) {
        if (err?.response?.status === 404) return "NOT FOUND" as const;
        return "ERROR" as const;
    }
};

export const deleteHeroCertificate = async (certificateId: number) => {
    try {
        const response = await apiClient.delete(`${HERO_CERTIFICATE_BASE}/${certificateId}/delete`);

        if (response.data?.status_code === 200) return "SUCCESS" as const;

        return "ERROR" as const;
    } catch (err: any) {
        if (err?.response?.status === 404) return "NOT FOUND" as const;
        return "ERROR" as const;
    }
};
