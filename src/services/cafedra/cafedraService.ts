import apiClient from "../../util/apiClient";

export interface LanguageSection {
    title: string;
    html_content?: string;
}

export interface TranslatedTextItem {
    az: {
        title: string;
        description: string;
    };
    en: {
        title: string;
        description: string;
    };
}

export interface LaboratoryObjective {
    id?: number;
    az: { title: string };
    en: { title: string };
}

export interface LaboratoryGalleryImage {
    id: number;
    image_url: string;
}

export interface Laboratory {
    id?: number;
    cafedra_code?: string;
    image_url?: string | null;
    room_number?: string;
    email?: string;
    phone_number?: string;
    az: {
        title: string;
        html_content: string;
    };
    en: {
        title: string;
        html_content: string;
    };
    objectives: LaboratoryObjective[];
    gallery_images: LaboratoryGalleryImage[];
}

export interface WorkingHour {
    az: { day: string };
    en: { day: string };
    time_range: string;
}

export interface EducationItem {
    az: { degree: string; university: string };
    en: { degree: string; university: string };
    start_year: string;
    end_year: string;
}

export interface DirectorPayload {
    first_name: string;
    last_name: string;
    father_name: string;
    az: { scientific_degree: string; scientific_title: string; bio: string; scientific_research_fields: string[] };
    en: { scientific_degree: string; scientific_title: string; bio: string; scientific_research_fields: string[] };
    email: string;
    phone: string;
    room_number: string;
    working_hours: WorkingHour[];
    educations: EducationItem[];
    profile_image?: string;
}

export interface Worker {
    id?: number;
    first_name: string;
    last_name: string;
    father_name: string;
    email: string;
    phone: string;
    az: { duty: string; scientific_name: string; scientific_degree: string };
    en: { duty: string; scientific_name: string; scientific_degree: string };
    profile_image?: string;
}

export interface Cafedra {
    cafedra_code: string;
    faculty_code: string;
    cafedra_name: string;
}

export interface CafedraDetail extends CreateCafedraPayload {
    cafedra_code: string;
}

export interface CreateCafedraPayload {
    faculty_code: string;
    az: LanguageSection;
    en: LanguageSection;
    director?: DirectorPayload | null;
    deputy_dean_count: number;
    deputy_deans: Worker[];
    scientific_council: Worker[];
    workers: Worker[];
    laboratories: Laboratory[];
    research_works: TranslatedTextItem[];
    partner_companies: TranslatedTextItem[];
    objectives: TranslatedTextItem[];
    duties: TranslatedTextItem[];
    projects: TranslatedTextItem[];
    directions_of_action: TranslatedTextItem[];
    bachelor_programs_count: number;
    master_programs_count: number;
    phd_programs_count: number;
    international_collaborations_count: number;
    laboratories_count: number;
    projects_patents_count: number;
    industrial_collaborations_count: number;
    sdgs: number[];
}

export interface UpdateCafedraPayload extends Partial<CreateCafedraPayload> {
    cafedra_code: string;
}

const CAFEDRA_ADMIN_BASE = "/api/cafedra";

export const getCafedras = async (start: number, end: number, faculty_code?: string) => {
    try {
        let url = `${CAFEDRA_ADMIN_BASE}/admin/all?start=${start}&end=${end}`;
        if (faculty_code) url += `&faculty_code=${faculty_code}`;

        const response = await apiClient.get(url);

        if (response.data.status_code === 200) {
            return {
                cafedras: response.data.cafedras as Cafedra[],
                total: response.data.total as number,
            };
        } else if (response.data.status_code === 204) {
            return "NO CONTENT";
        }

        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

// The cafedra detail endpoint returns a single language (flattened) per `?lang=`.
// To edit bilingually we fetch az + en and merge them into the nested az/en shape
// the form and the sub-entity managers expect.
const fetchCafedraRaw = async (cafedraCode: string, lang: string): Promise<any | "NOT FOUND" | "ERROR"> => {
    try {
        const response = await apiClient.get(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}?lang=${lang}`);
        if (response.data.status_code === 200) return response.data.cafedra;
        return "ERROR";
    } catch (err: any) {
        if (err.response && err.response.status === 404) return "NOT FOUND";
        return "ERROR";
    }
};

const mergePeople = (azArr: any[] = [], enArr: any[] = []) =>
    (azArr ?? []).map((a, i) => {
        const e = enArr?.[i] ?? {};
        return {
            id: a.id,
            first_name: a.first_name ?? "",
            last_name: a.last_name ?? "",
            father_name: a.father_name ?? "",
            email: a.email ?? "",
            phone: a.phone ?? "",
            profile_image: a.profile_image,
            az: { duty: a.duty ?? "", scientific_name: a.scientific_name ?? "", scientific_degree: a.scientific_degree ?? "" },
            en: { duty: e.duty ?? "", scientific_name: e.scientific_name ?? "", scientific_degree: e.scientific_degree ?? "" },
        };
    });

const mergeSections = (azArr: any[] = [], enArr: any[] = []) =>
    (azArr ?? []).map((a, i) => {
        const e = enArr?.[i] ?? {};
        return {
            az: { title: a.title ?? "", description: a.description ?? "" },
            en: { title: e.title ?? "", description: e.description ?? "" },
        };
    });

const mergeDirector = (a: any, e: any) => {
    if (!a) return null;
    e = e ?? {};
    return {
        first_name: a.first_name ?? "",
        last_name: a.last_name ?? "",
        father_name: a.father_name ?? "",
        email: a.email ?? "",
        phone: a.phone ?? "",
        room_number: a.room_number ?? "",
        profile_image: a.profile_image,
        az: {
            scientific_degree: a.scientific_degree ?? "",
            scientific_title: a.scientific_title ?? "",
            bio: a.bio ?? "",
            scientific_research_fields: a.scientific_research_fields ?? [],
        },
        en: {
            scientific_degree: e.scientific_degree ?? "",
            scientific_title: e.scientific_title ?? "",
            bio: e.bio ?? "",
            scientific_research_fields: e.scientific_research_fields ?? [],
        },
        working_hours: (a.working_hours ?? []).map((wh: any, i: number) => ({
            az: { day: wh.day ?? "" },
            en: { day: e.working_hours?.[i]?.day ?? "" },
            time_range: wh.time_range ?? "",
        })),
        educations: (a.educations ?? []).map((ed: any, i: number) => ({
            az: { degree: ed.degree ?? "", university: ed.university ?? "" },
            en: { degree: e.educations?.[i]?.degree ?? "", university: e.educations?.[i]?.university ?? "" },
            start_year: ed.start_year ?? "",
            end_year: ed.end_year ?? "",
        })),
    };
};

const mergeLabs = (azArr: any[] = [], enArr: any[] = []) =>
    (azArr ?? []).map((a, i) => {
        const e = enArr?.[i] ?? {};
        return {
            id: a.id,
            cafedra_code: a.cafedra_code,
            image_url: a.image_url ?? null,
            room_number: a.room_number ?? "",
            email: a.email ?? "",
            phone_number: a.phone_number ?? "",
            az: { title: a.title ?? "", html_content: a.html_content ?? "" },
            en: { title: e.title ?? "", html_content: e.html_content ?? "" },
            objectives: (a.objectives ?? []).map((o: any, j: number) => ({
                id: o.id,
                az: { title: o.title ?? "" },
                en: { title: e.objectives?.[j]?.title ?? "" },
            })),
            gallery_images: a.gallery_images ?? [],
        };
    });

export const getCafedraDetails = async (cafedraCode: string): Promise<CafedraDetail | "NOT FOUND" | "ERROR"> => {
    const [az, en] = await Promise.all([fetchCafedraRaw(cafedraCode, "az"), fetchCafedraRaw(cafedraCode, "en")]);

    if (az === "NOT FOUND" || en === "NOT FOUND") return "NOT FOUND";
    if (az === "ERROR" || en === "ERROR" || !az) return "ERROR";

    const enObj = typeof en === "object" && en ? en : {};
    const deputies = mergePeople(az.deputy_directors, enObj.deputy_directors);

    const merged = {
        ...az,
        az: { title: az.title ?? "", html_content: az.html_content ?? "" },
        en: { title: enObj.title ?? "", html_content: enObj.html_content ?? "" },
        director: mergeDirector(az.director, enObj.director),
        deputy_directors: deputies,
        // The big form reads `deputy_deans`; expose the same merged list under that key too.
        deputy_deans: deputies,
        scientific_council: mergePeople(az.scientific_council, enObj.scientific_council),
        workers: mergePeople(az.workers, enObj.workers),
        laboratories: mergeLabs(az.laboratories, enObj.laboratories),
        research_works: mergeSections(az.research_works, enObj.research_works),
        partner_companies: mergeSections(az.partner_companies, enObj.partner_companies),
        objectives: mergeSections(az.objectives, enObj.objectives),
        duties: mergeSections(az.duties, enObj.duties),
        projects: mergeSections(az.projects, enObj.projects),
        directions_of_action: mergeSections(az.directions_of_action, enObj.directions_of_action),
    };

    return merged as unknown as CafedraDetail;
};

export const createCafedra = async (payload: CreateCafedraPayload) => {
    try {
        const response = await apiClient.post(`${CAFEDRA_ADMIN_BASE}/create`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        if (response.data.status_code === 201) {
            return { status: "SUCCESS", cafedra: response.data.cafedra as CafedraDetail };
        }

        return { status: "ERROR" };
    } catch (err: any) {
        return { status: "ERROR" };
    }
};

export const updateCafedra = async (payload: UpdateCafedraPayload) => {
    try {
        const response = await apiClient.put(`${CAFEDRA_ADMIN_BASE}/${payload.cafedra_code}`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        if (response.data.status_code === 200) {
            return { status: "SUCCESS", cafedra: response.data.cafedra as CafedraDetail };
        }

        return { status: "ERROR" };
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return { status: "NOT FOUND" };
        }
        return { status: "ERROR" };
    }
};

export const deleteCafedra = async (cafedraCode: string) => {
    try {
        const response = await apiClient.delete(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}`);

        if (response.data.status_code === 200) {
            return "SUCCESS";
        }

        return "ERROR";
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return "NOT FOUND";
        }
        return "ERROR";
    }
};

export const uploadCafedraDirectorImage = async (cafedraCode: string, imageFile: File) => {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await apiClient.put(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/director/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 200) {
            return "SUCCESS";
        }
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

export const uploadCafedraWorkerImage = async (workerId: number, imageFile: File) => {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await apiClient.put(`${CAFEDRA_ADMIN_BASE}/workers/${workerId}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 200) {
            return "SUCCESS";
        }
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

export const uploadCafedraDeputyDirectorImage = async (deputyDirectorId: number, imageFile: File) => {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await apiClient.put(`${CAFEDRA_ADMIN_BASE}/deputy-directors/${deputyDirectorId}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 200) {
            return "SUCCESS";
        }
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

// ============================================================
// Standalone sub-entity CRUD (incremental management on detail page)
// ============================================================

/** Shared create/update payload for any cafedra person (worker / deputy director / council member). */
export type CafedraPersonPayload = {
    first_name: string;
    last_name: string;
    father_name: string;
    email: string;
    phone: string;
    az: { duty: string; scientific_name: string; scientific_degree: string };
    en: { duty: string; scientific_name: string; scientific_degree: string };
};

export type CreateResult = { status: "SUCCESS"; id: number } | { status: "ERROR" };
export type MutateResult = "SUCCESS" | "NOT FOUND" | "ERROR";

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

// Workers
export const createCafedraWorker = (cafedraCode: string, payload: CafedraPersonPayload) =>
    _create(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/workers`, payload);
export const updateCafedraWorker = (workerId: number, payload: CafedraPersonPayload) =>
    _update(`${CAFEDRA_ADMIN_BASE}/workers/${workerId}`, payload);
export const deleteCafedraWorker = (workerId: number) =>
    _delete(`${CAFEDRA_ADMIN_BASE}/workers/${workerId}`);

// Deputy directors
export const createCafedraDeputyDirector = (cafedraCode: string, payload: CafedraPersonPayload) =>
    _create(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/deputy-directors`, payload);
export const updateCafedraDeputyDirector = (deputyDirectorId: number, payload: CafedraPersonPayload) =>
    _update(`${CAFEDRA_ADMIN_BASE}/deputy-directors/${deputyDirectorId}`, payload);
export const deleteCafedraDeputyDirector = (deputyDirectorId: number) =>
    _delete(`${CAFEDRA_ADMIN_BASE}/deputy-directors/${deputyDirectorId}`);

// Scientific council
export const createCafedraScientificCouncilMember = (cafedraCode: string, payload: CafedraPersonPayload) =>
    _create(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/scientific-council`, payload);
export const updateCafedraScientificCouncilMember = (memberId: number, payload: CafedraPersonPayload) =>
    _update(`${CAFEDRA_ADMIN_BASE}/scientific-council/${memberId}`, payload);
export const deleteCafedraScientificCouncilMember = (memberId: number) =>
    _delete(`${CAFEDRA_ADMIN_BASE}/scientific-council/${memberId}`);

// ============================================================
// LABORATORY API
// ============================================================

export const getAllLaboratories = async (start: number, end: number, lang: string = "az") => {
    try {
        const response = await apiClient.get(`${CAFEDRA_ADMIN_BASE}/laboratories/all?start=${start}&end=${end}&lang=${lang}`);
        if (response.data.status_code === 200) {
            return {
                laboratories: response.data.data as Laboratory[],
                total: response.data.total as number,
            };
        }
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

export const getCafedraLaboratories = async (cafedraCode: string, lang: string = "az") => {
    try {
        const response = await apiClient.get(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/laboratories?lang=${lang}`);
        if (response.data.status_code === 200) {
            return response.data.data as Laboratory[];
        }
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

export const createLaboratory = async (cafedraCode: string, payload: Laboratory) => {
    try {
        const response = await apiClient.post(`${CAFEDRA_ADMIN_BASE}/${cafedraCode}/laboratories`, payload);
        if (response.data.status_code === 201) {
            return { status: "SUCCESS", id: (response.data.data?.id ?? response.data.id) as number };
        }
        return { status: "ERROR" };
    } catch (err: any) {
        return { status: "ERROR" };
    }
};

export const updateLaboratory = (laboratoryId: number, payload: Partial<Laboratory>) =>
    _update(`${CAFEDRA_ADMIN_BASE}/laboratories/${laboratoryId}`, payload);

export const deleteLaboratory = (laboratoryId: number) =>
    _delete(`${CAFEDRA_ADMIN_BASE}/laboratories/${laboratoryId}`);

export const uploadLaboratoryImage = async (laboratoryId: number, imageFile: File) => {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await apiClient.put(`${CAFEDRA_ADMIN_BASE}/laboratories/${laboratoryId}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 200) {
            return "SUCCESS";
        }
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};

export const uploadLaboratoryGalleryImage = async (laboratoryId: number, imageFile: File) => {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const response = await apiClient.post(`${CAFEDRA_ADMIN_BASE}/laboratories/${laboratoryId}/gallery`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.status_code === 201 || response.data.status_code === 200) {
            const data = response.data.data ?? response.data;
            return { status: "SUCCESS", id: data.id as number | undefined, image_url: data.image_url as string | undefined };
        }
        return { status: "ERROR" };
    } catch (err: any) {
        return { status: "ERROR" };
    }
};

export const deleteLaboratoryGalleryImage = async (galleryImageId: number) => {
    try {
        const response = await apiClient.delete(`${CAFEDRA_ADMIN_BASE}/laboratories/gallery/${galleryImageId}`);
        if (response.data.status_code === 200 || response.data.status_code === 204) {
            return "SUCCESS";
        }
        return "ERROR";
    } catch (err: any) {
        return "ERROR";
    }
};
