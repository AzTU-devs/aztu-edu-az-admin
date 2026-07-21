import apiClient from "../../util/apiClient";
import { uploadImageError } from "./cafedraService";
import type {
    CafedraScientificActivity,
    IntroKey,
    LaboratoryRefItem,
    PartnerRowValue,
    ProjectRowValue,
    PublicationIndex,
    PublicationQuartile,
    PublicationRowValue,
    PatentRowValue,
    PublicationYearBucket,
    RichTextRowValue,
    ScientificIntrosValue,
} from "../../types/scientificActivity";

export type CreateResult = { status: "SUCCESS"; id: number } | { status: "ERROR" };
export type MutateResult = "SUCCESS" | "NOT FOUND" | "ERROR";

export interface ScientificIntrosPayload {
    az?: Partial<Record<IntroKey, string>>;
    en?: Partial<Record<IntroKey, string>>;
}

export interface ResearchAreaPayload {
    az: { title: string; html_content: string };
    en: { title: string; html_content: string };
}

export interface ProjectPayload {
    url: string;
    az: { title: string; description: string };
    en: { title: string; description: string };
}

export interface PartnerCompanyPayload {
    website_url: string;
    az: { title: string; description: string };
    en: { title: string; description: string };
}

export interface PublicationPayload {
    index: PublicationIndex;
    quartile: PublicationQuartile | "" | null;
    year: number | "" | null;
    date: string;
    url: string;
    az: { title: string; authors: string; journal: string; country: string };
    en: { title: string; authors: string; journal: string; country: string };
}

export interface PatentPayload {
    patent_number: string;
    year: number | "" | null;
    url: string;
    az: { title: string; authors: string };
    en: { title: string; authors: string };
}

export interface ScientificActivityBilingual {
    cafedra_code: string;
    intros: ScientificIntrosValue;
    research_areas: RichTextRowValue[];
    projects_grants: ProjectRowValue[];
    publications: PublicationRowValue[];
    publication_years: PublicationYearBucket[];
    patents: PatentRowValue[];
    patent_years: PublicationYearBucket[];
    industry_cooperation: PartnerRowValue[];
    laboratories: LaboratoryRefItem[];
}

const CAFEDRA_ADMIN_BASE = "/api/cafedra";

const INTRO_KEYS: IntroKey[] = [
    "research_areas_intro",
    "projects_grants_intro",
    "publications_intro",
    "patents_intro",
    "industry_cooperation_intro",
    "international_cooperation_intro",
];

export const getScientificActivity = async (
    code: string,
    lang: "az" | "en"
): Promise<CafedraScientificActivity | "NOT FOUND" | "ERROR"> => {
    try {
        const response = await apiClient.get(`${CAFEDRA_ADMIN_BASE}/${code}/scientific-activity?lang=${lang}`);
        if (response.data.status_code === 200) {
            return response.data.scientific_activity as CafedraScientificActivity;
        }
        return "ERROR";
    } catch (err: any) {
        if (err.response && err.response.status === 404) return "NOT FOUND";
        return "ERROR";
    }
};

// Pairs AZ items with their EN twin by the stable row `id`. Never positional:
// the two language arrays diverge the moment a row exists in only one language,
// and index pairing then silently attaches the wrong translation.
const mergeById = <A extends { id: number }, E extends { id: number }>(azArr: A[] = [], enArr: E[] = []) => {
    const en = new Map((enArr ?? []).map((e) => [e.id, e]));
    return (azArr ?? []).map((a) => ({ a, e: en.get(a.id) }));
};

const uid = () => crypto.randomUUID();

export const emptyScientificIntros = (): ScientificIntrosValue => ({
    az: INTRO_KEYS.reduce((acc, key) => ({ ...acc, [key]: "" }), {} as Record<IntroKey, string>),
    en: INTRO_KEYS.reduce((acc, key) => ({ ...acc, [key]: "" }), {} as Record<IntroKey, string>),
});

const introsOf = (az: CafedraScientificActivity, en: CafedraScientificActivity): ScientificIntrosValue => ({
    az: {
        research_areas_intro: az.sections.research_areas.intro_html ?? "",
        projects_grants_intro: az.sections.projects_grants.intro_html ?? "",
        publications_intro: az.sections.publications.intro_html ?? "",
        patents_intro: az.sections.patents?.intro_html ?? "",
        industry_cooperation_intro: az.sections.industry_cooperation.intro_html ?? "",
        international_cooperation_intro: az.sections.international_cooperation.intro_html ?? "",
    },
    en: {
        research_areas_intro: en.sections.research_areas.intro_html ?? "",
        projects_grants_intro: en.sections.projects_grants.intro_html ?? "",
        publications_intro: en.sections.publications.intro_html ?? "",
        patents_intro: en.sections.patents?.intro_html ?? "",
        industry_cooperation_intro: en.sections.industry_cooperation.intro_html ?? "",
        international_cooperation_intro: en.sections.international_cooperation.intro_html ?? "",
    },
});

// The API returns one language per call, but the admin edits both at once.
export const getScientificActivityBilingual = async (
    code: string
): Promise<ScientificActivityBilingual | "NOT FOUND" | "ERROR"> => {
    const [az, en] = await Promise.all([getScientificActivity(code, "az"), getScientificActivity(code, "en")]);

    if (az === "NOT FOUND" || en === "NOT FOUND") return "NOT FOUND";
    if (az === "ERROR" || en === "ERROR") return "ERROR";

    return {
        cafedra_code: az.cafedra_code,
        intros: introsOf(az, en),
        research_areas: mergeById(az.sections.research_areas.items, en.sections.research_areas.items).map(
            ({ a, e }): RichTextRowValue => ({
                uid: uid(),
                id: a.id,
                az: { title: a.title ?? "", html_content: a.html_content ?? "" },
                en: { title: e?.title ?? "", html_content: e?.html_content ?? "" },
            })
        ),
        projects_grants: mergeById(az.sections.projects_grants.items, en.sections.projects_grants.items).map(
            ({ a, e }): ProjectRowValue => ({
                uid: uid(),
                id: a.id,
                url: a.url ?? "",
                az: { title: a.title ?? "", description: a.description ?? "" },
                en: { title: e?.title ?? "", description: e?.description ?? "" },
            })
        ),
        publications: mergeById(az.sections.publications.items, en.sections.publications.items).map(
            ({ a, e }): PublicationRowValue => ({
                uid: uid(),
                id: a.id,
                index: a.index,
                quartile: a.quartile ?? "",
                year: a.year ?? "",
                date: a.date ?? "",
                url: a.url ?? "",
                az: {
                    title: a.title ?? "",
                    authors: a.authors ?? "",
                    journal: a.journal ?? "",
                    country: a.country ?? "",
                },
                en: {
                    title: e?.title ?? "",
                    authors: e?.authors ?? "",
                    journal: e?.journal ?? "",
                    country: e?.country ?? "",
                },
            })
        ),
        publication_years: az.sections.publications.years ?? [],
        // Optional-chained: a backend that predates the patents section returns
        // no key at all, and the form must still load rather than crash.
        patents: mergeById(az.sections.patents?.items ?? [], en.sections.patents?.items ?? []).map(
            ({ a, e }): PatentRowValue => ({
                uid: uid(),
                id: a.id,
                patent_number: a.patent_number ?? "",
                year: a.year ?? "",
                url: a.url ?? "",
                az: { title: a.title ?? "", authors: a.authors ?? "" },
                en: { title: e?.title ?? "", authors: e?.authors ?? "" },
            })
        ),
        patent_years: az.sections.patents?.years ?? [],
        industry_cooperation: mergeById(az.sections.industry_cooperation.items, en.sections.industry_cooperation.items).map(
            ({ a, e }): PartnerRowValue => ({
                uid: uid(),
                id: a.id,
                website_url: a.website_url ?? "",
                logo_url: a.logo_url,
                az: { title: a.title ?? "", description: a.description ?? "" },
                en: { title: e?.title ?? "", description: e?.description ?? "" },
            })
        ),
        laboratories: az.sections.laboratories.items ?? [],
    };
};

// ============================================================
// Per-item CRUD
// ============================================================

const _create = async (url: string, payload: unknown): Promise<CreateResult> => {
    try {
        const response = await apiClient.post(url, payload, { headers: { "Content-Type": "application/json" } });
        if (response.data.status_code === 201) {
            return { status: "SUCCESS", id: response.data.data?.id as number };
        }
        return { status: "ERROR" };
    } catch {
        return { status: "ERROR" };
    }
};

const _update = async (url: string, payload: unknown): Promise<MutateResult> => {
    try {
        const response = await apiClient.put(url, payload, { headers: { "Content-Type": "application/json" } });
        if (response.data.status_code === 200) return "SUCCESS";
        if (response.data.status_code === 404) return "NOT FOUND";
        return "ERROR";
    } catch (err: any) {
        if (err.response?.status === 404) return "NOT FOUND";
        return "ERROR";
    }
};

const _delete = async (url: string): Promise<MutateResult> => {
    try {
        const response = await apiClient.delete(url);
        if (response.data.status_code === 200) return "SUCCESS";
        if (response.data.status_code === 404) return "NOT FOUND";
        return "ERROR";
    } catch (err: any) {
        if (err.response?.status === 404) return "NOT FOUND";
        return "ERROR";
    }
};

// Intros
export const updateScientificIntros = (cafedraCode: string, payload: ScientificIntrosPayload) =>
    _update(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/scientific-activity/intros`, payload);

// Research areas
export const createResearchArea = (cafedraCode: string, payload: ResearchAreaPayload) =>
    _create(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/research-areas`, payload);
export const updateResearchArea = (itemId: number, payload: ResearchAreaPayload) =>
    _update(`${CAFEDRA_ADMIN_BASE}/research-areas/${itemId}`, payload);
export const deleteResearchArea = (itemId: number) =>
    _delete(`${CAFEDRA_ADMIN_BASE}/research-areas/${itemId}`);

// Projects and grants
export const createProject = (cafedraCode: string, payload: ProjectPayload) =>
    _create(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/projects`, payload);
export const updateProject = (itemId: number, payload: ProjectPayload) =>
    _update(`${CAFEDRA_ADMIN_BASE}/projects/${itemId}`, payload);
export const deleteProject = (itemId: number) =>
    _delete(`${CAFEDRA_ADMIN_BASE}/projects/${itemId}`);

// Partner companies (industry cooperation)
export const createPartnerCompany = (cafedraCode: string, payload: PartnerCompanyPayload) =>
    _create(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/partner-companies`, payload);
export const updatePartnerCompany = (itemId: number, payload: PartnerCompanyPayload) =>
    _update(`${CAFEDRA_ADMIN_BASE}/partner-companies/${itemId}`, payload);
export const deletePartnerCompany = (itemId: number) =>
    _delete(`${CAFEDRA_ADMIN_BASE}/partner-companies/${itemId}`);

export const uploadPartnerCompanyLogo = async (itemId: number, imageFile: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await apiClient.put(`${CAFEDRA_ADMIN_BASE}/partner-companies/${itemId}/logo`, formData);
        if (response.data.status_code === 200) return "SUCCESS";
        return uploadImageError({ response });
    } catch (err: any) {
        console.error("Partner company logo upload failed:", err?.response?.status, err?.response?.data);
        return uploadImageError(err);
    }
};

// Publications
export const createPublication = (cafedraCode: string, payload: PublicationPayload) =>
    _create(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/publications`, payload);
export const updatePublication = (itemId: number, payload: PublicationPayload) =>
    _update(`${CAFEDRA_ADMIN_BASE}/publications/${itemId}`, payload);
export const deletePublication = (itemId: number) =>
    _delete(`${CAFEDRA_ADMIN_BASE}/publications/${itemId}`);

// Reordering operates within a single year group; `ids` is that group in its new order.
export const reorderPublications = (cafedraCode: string, ids: number[]) =>
    _update(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/publications/reorder`, { ids });

// Patents
export const createPatent = (cafedraCode: string, payload: PatentPayload) =>
    _create(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/patents`, payload);
export const updatePatent = (itemId: number, payload: PatentPayload) =>
    _update(`${CAFEDRA_ADMIN_BASE}/patents/${itemId}`, payload);
export const deletePatent = (itemId: number) =>
    _delete(`${CAFEDRA_ADMIN_BASE}/patents/${itemId}`);
export const reorderPatents = (cafedraCode: string, ids: number[]) =>
    _update(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/patents/reorder`, { ids });
