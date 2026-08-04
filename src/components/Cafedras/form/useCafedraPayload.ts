import { useCallback, useState } from "react";
import {
  CreateCafedraPayload,
  DirectorPayload,
  EducationItem,
  Laboratory,
  LaboratoryObjective,
  TranslatedTextItem,
  WorkingHour,
} from "../../../services/cafedra/cafedraService";

/** Every repeatable row carries a client-side uid so React keys and the pending
 *  File maps survive a delete in the middle of the list. It is stripped before
 *  the payload reaches the API. */
export type WithUid<T> = T & { uid: string };

export const newUid = () => crypto.randomUUID();

export type TranslatedListKey =
  | "research_works"
  | "partner_companies"
  | "objectives"
  | "duties"
  | "projects"
  | "directions_of_action";

export type PersonnelListKey = "workers" | "deputy_deans" | "scientific_council";

export const blankTranslatedItem = (): WithUid<TranslatedTextItem> => ({
  uid: newUid(),
  az: { title: "", description: "" },
  en: { title: "", description: "" },
});

export const blankPersonnelItem = () => ({
  uid: newUid(),
  email: "",
  phone: "",
  phone_code: "",
  az: { first_name: "", last_name: "", duty: "", scientific_name: "", scientific_degree: "", room: "", working_hours: "" },
  en: { first_name: "", last_name: "", duty: "", scientific_name: "", scientific_degree: "", room: "", working_hours: "" },
});

export const blankLaboratory = (): WithUid<Laboratory> => ({
  uid: newUid(),
  az: { title: "", html_content: "" },
  en: { title: "", html_content: "" },
  image_url: null,
  room_number: "",
  email: "",
  phone_number: "",
  objectives: [],
  gallery_images: [],
});

export const blankLaboratoryObjective = (): WithUid<LaboratoryObjective> => ({
  uid: newUid(),
  az: { title: "" },
  en: { title: "" },
});

export const blankWorkingHour = (): WithUid<WorkingHour> => ({
  uid: newUid(),
  az: { day: "" },
  en: { day: "" },
  time_range: "",
});

export const blankEducation = (): WithUid<EducationItem> => ({
  uid: newUid(),
  az: { degree: "", university: "" },
  en: { degree: "", university: "" },
  start_year: "",
  end_year: "",
});

export const blankDirector = (): DirectorPayload => ({
  az: { first_name: "", last_name: "", scientific_degree: "", scientific_title: "", bio: "", scientific_research_fields: [], room: "" },
  en: { first_name: "", last_name: "", scientific_degree: "", scientific_title: "", bio: "", scientific_research_fields: [], room: "" },
  email: "",
  phone: "",
  phone_code: "",
  working_hours: [],
  educations: [],
});

export const blankCafedraPayload = (): CreateCafedraPayload => ({
  faculty_code: "",
  az: { title: "", html_content: "" },
  en: { title: "", html_content: "" },
  director: null,
  deputy_dean_count: 0,
  deputy_deans: [],
  scientific_council: [],
  workers: [],
  laboratories: [],
  research_works: [],
  partner_companies: [],
  objectives: [],
  duties: [],
  projects: [],
  directions_of_action: [],
  bachelor_programs_count: 0,
  master_programs_count: 0,
  phd_programs_count: 0,
  international_collaborations_count: 0,
  laboratories_count: 0,
  projects_patents_count: 0,
  industrial_collaborations_count: 0,
  sdgs: [],
});

const translatedList = (value: any): WithUid<TranslatedTextItem>[] =>
  (Array.isArray(value) ? value : []).map((item: any) => ({
    uid: newUid(),
    az: { title: item.az?.title ?? "", description: item.az?.description ?? "" },
    en: { title: item.en?.title ?? "", description: item.en?.description ?? "" },
  }));

const personnelList = (value: any) =>
  (Array.isArray(value) ? value : []).map((item: any) => ({
    uid: newUid(),
    id: item.id,
    profile_image: item.profile_image,
    email: item.email ?? "",
    phone: item.phone ?? "",
    phone_code: item.phone_code ?? "",
    az: {
      first_name: item.az?.first_name ?? "",
      last_name: item.az?.last_name ?? "",
      duty: item.az?.duty ?? "",
      scientific_name: item.az?.scientific_name ?? "",
      scientific_degree: item.az?.scientific_degree ?? "",
      room: item.az?.room ?? "",
      working_hours: item.az?.working_hours ?? "",
    },
    en: {
      first_name: item.en?.first_name ?? "",
      last_name: item.en?.last_name ?? "",
      duty: item.en?.duty ?? "",
      scientific_name: item.en?.scientific_name ?? "",
      scientific_degree: item.en?.scientific_degree ?? "",
      room: item.en?.room ?? "",
      working_hours: item.en?.working_hours ?? "",
    },
  }));

export const normalizeCafedraPayload = (value: any): CreateCafedraPayload => {
  if (!value) return blankCafedraPayload();

  return {
    faculty_code: value.faculty_code ?? "",
    az: { title: value.az?.title ?? "", html_content: value.az?.html_content ?? "" },
    en: { title: value.en?.title ?? "", html_content: value.en?.html_content ?? "" },
    director:
      value.director === null || value.director === undefined
        ? null
        : {
            az: {
              first_name: value.director?.az?.first_name ?? "",
              last_name: value.director?.az?.last_name ?? "",
              scientific_degree: value.director?.az?.scientific_degree ?? "",
              scientific_title: value.director?.az?.scientific_title ?? "",
              bio: value.director?.az?.bio ?? "",
              scientific_research_fields: Array.isArray(value.director?.az?.scientific_research_fields)
                ? value.director.az.scientific_research_fields
                : [],
              room: value.director?.az?.room ?? "",
            },
            en: {
              first_name: value.director?.en?.first_name ?? "",
              last_name: value.director?.en?.last_name ?? "",
              scientific_degree: value.director?.en?.scientific_degree ?? "",
              scientific_title: value.director?.en?.scientific_title ?? "",
              bio: value.director?.en?.bio ?? "",
              scientific_research_fields: Array.isArray(value.director?.en?.scientific_research_fields)
                ? value.director.en.scientific_research_fields
                : [],
              room: value.director?.en?.room ?? "",
            },
            email: value.director?.email ?? "",
            phone: value.director?.phone ?? "",
            phone_code: value.director?.phone_code ?? "",
            working_hours: (Array.isArray(value.director?.working_hours) ? value.director.working_hours : []).map(
              (wh: any) => ({
                uid: newUid(),
                az: { day: wh.az?.day ?? "" },
                en: { day: wh.en?.day ?? "" },
                time_range: wh.time_range ?? "",
              })
            ),
            educations: (Array.isArray(value.director?.educations) ? value.director.educations : []).map((ed: any) => ({
              uid: newUid(),
              az: { degree: ed.az?.degree ?? "", university: ed.az?.university ?? "" },
              en: { degree: ed.en?.degree ?? "", university: ed.en?.university ?? "" },
              start_year: ed.start_year ?? "",
              end_year: ed.end_year ?? "",
            })),
            profile_image: value.director?.profile_image,
          },
    deputy_dean_count: value.deputy_dean_count ?? 0,
    deputy_deans: personnelList(value.deputy_deans),
    scientific_council: personnelList(value.scientific_council),
    workers: personnelList(value.workers),
    laboratories: (Array.isArray(value.laboratories) ? value.laboratories : []).map((item: any) => ({
      uid: newUid(),
      id: item.id,
      image_url: item.image_url ?? null,
      room_number: item.room_number ?? "",
      email: item.email ?? "",
      phone_number: item.phone_number ?? "",
      az: { title: item.az?.title ?? "", html_content: item.az?.html_content ?? item.az?.description ?? "" },
      en: { title: item.en?.title ?? "", html_content: item.en?.html_content ?? item.en?.description ?? "" },
      objectives: (Array.isArray(item.objectives) ? item.objectives : []).map((obj: any) => ({
        uid: newUid(),
        id: obj.id,
        az: { title: obj.az?.title ?? obj.title ?? "" },
        en: { title: obj.en?.title ?? obj.title ?? "" },
      })),
      gallery_images: (Array.isArray(item.gallery_images) ? item.gallery_images : []).map((g: any) => ({
        id: g.id,
        image_url: g.image_url ?? "",
      })),
    })),
    research_works: translatedList(value.research_works),
    partner_companies: translatedList(value.partner_companies),
    objectives: translatedList(value.objectives),
    duties: translatedList(value.duties),
    projects: translatedList(value.projects),
    directions_of_action: translatedList(value.directions_of_action),
    bachelor_programs_count: value.bachelor_programs_count ?? 0,
    master_programs_count: value.master_programs_count ?? 0,
    phd_programs_count: value.phd_programs_count ?? 0,
    international_collaborations_count: value.international_collaborations_count ?? 0,
    laboratories_count: value.laboratories_count ?? 0,
    projects_patents_count: value.projects_patents_count ?? 0,
    industrial_collaborations_count: value.industrial_collaborations_count ?? 0,
    sdgs: Array.isArray(value.sdgs) ? value.sdgs : [],
  };
};

/** `uid` is a client-side React key; the API rejects unknown keys on some
 *  nested schemas, so peel it off every row right before submitting. */
export const stripUids = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map((v) => stripUids(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key === "uid") continue;
      out[key] = stripUids(val);
    }
    return out as T;
  }
  return value;
};

export function useCafedraPayload(initialValue: any) {
  const [payload, setPayload] = useState<CreateCafedraPayload>(() => normalizeCafedraPayload(initialValue));

  const changeField = useCallback((section: "az" | "en", field: "title" | "html_content", value: string) => {
    setPayload((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  }, []);

  const changeStatField = useCallback((field: keyof CreateCafedraPayload, value: number) => {
    setPayload((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFacultyCode = useCallback((value: string) => {
    setPayload((prev) => ({ ...prev, faculty_code: value }));
  }, []);

  const setSDGs = useCallback((sdgs: number[]) => {
    setPayload((prev) => ({ ...prev, sdgs: [...sdgs].sort((a, b) => a - b) }));
  }, []);

  const toggleSDG = useCallback((sdg: number) => {
    setPayload((prev) => {
      const current = prev.sdgs ?? [];
      if (current.includes(sdg)) return { ...prev, sdgs: current.filter((s) => s !== sdg) };
      return { ...prev, sdgs: [...current, sdg].sort((a, b) => a - b) };
    });
  }, []);

  const addListItem = useCallback(<K extends keyof CreateCafedraPayload>(section: K, item: any) => {
    setPayload((prev) => {
      const current = Array.isArray(prev[section]) ? [...(prev[section] as any[])] : [];
      return { ...prev, [section]: [...current, item] };
    });
  }, []);

  const removeListItem = useCallback(<K extends keyof CreateCafedraPayload>(section: K, uid: string) => {
    setPayload((prev) => {
      const list = Array.isArray(prev[section]) ? (prev[section] as any[]) : [];
      return { ...prev, [section]: list.filter((row) => row.uid !== uid) };
    });
  }, []);

  const updateListItem = useCallback(
    <K extends keyof CreateCafedraPayload>(section: K, uid: string, field: string, value: unknown) => {
      setPayload((prev) => {
        const list = Array.isArray(prev[section]) ? (prev[section] as any[]) : [];
        return {
          ...prev,
          [section]: list.map((row) => (row.uid === uid ? { ...row, [field]: value } : row)),
        };
      });
    },
    []
  );

  const updateTranslatedListItem = useCallback(
    <K extends keyof CreateCafedraPayload>(
      section: K,
      uid: string,
      lang: "az" | "en",
      field: string,
      value: string
    ) => {
      setPayload((prev) => {
        const list = Array.isArray(prev[section]) ? (prev[section] as any[]) : [];
        return {
          ...prev,
          [section]: list.map((row) =>
            row.uid === uid ? { ...row, [lang]: { ...row[lang], [field]: value } } : row
          ),
        };
      });
    },
    []
  );

  // ── Director ──────────────────────────────────────────────────────────────
  const changeDirectorField = useCallback((field: keyof DirectorPayload, value: string) => {
    setPayload((prev) => ({
      ...prev,
      director: prev.director ? { ...prev.director, [field]: value } : { ...blankDirector(), [field]: value },
    }));
  }, []);

  const changeDirectorLanguageField = useCallback(
    (lang: "az" | "en", field: "first_name" | "last_name" | "scientific_degree" | "scientific_title" | "bio" | "room", value: string) => {
      setPayload((prev) => {
        const director = prev.director ?? blankDirector();
        return { ...prev, director: { ...director, [lang]: { ...director[lang], [field]: value } } };
      });
    },
    []
  );

  const updateDirectorResearchFields = useCallback((lang: "az" | "en", value: string) => {
    const fields = value.split(",").map((f) => f.trim()).filter((f) => f !== "");
    setPayload((prev) => {
      const director = prev.director ?? blankDirector();
      return {
        ...prev,
        director: { ...director, [lang]: { ...director[lang], scientific_research_fields: fields } },
      };
    });
  }, []);

  const addDirectorArrayItem = useCallback((arrayName: "working_hours" | "educations", item: any) => {
    setPayload((prev) => {
      const director = prev.director ?? blankDirector();
      return {
        ...prev,
        director: { ...director, [arrayName]: [...((director[arrayName] as any[]) ?? []), item] },
      };
    });
  }, []);

  const removeDirectorArrayItem = useCallback((arrayName: "working_hours" | "educations", uid: string) => {
    setPayload((prev) => {
      if (!prev.director) return prev;
      const list = ((prev.director[arrayName] as any[]) ?? []).filter((row) => row.uid !== uid);
      return { ...prev, director: { ...prev.director, [arrayName]: list } as DirectorPayload };
    });
  }, []);

  const updateDirectorArrayItem = useCallback(
    (arrayName: "working_hours" | "educations", uid: string, field: string, value: string) => {
      setPayload((prev) => {
        if (!prev.director) return prev;
        const list = ((prev.director[arrayName] as any[]) ?? []).map((row) =>
          row.uid === uid ? { ...row, [field]: value } : row
        );
        return { ...prev, director: { ...prev.director, [arrayName]: list } as DirectorPayload };
      });
    },
    []
  );

  const updateDirectorLanguageArrayItem = useCallback(
    (arrayName: "working_hours" | "educations", uid: string, lang: "az" | "en", field: string, value: string) => {
      setPayload((prev) => {
        if (!prev.director) return prev;
        const list = ((prev.director[arrayName] as any[]) ?? []).map((row) =>
          row.uid === uid ? { ...row, [lang]: { ...row[lang], [field]: value } } : row
        );
        return { ...prev, director: { ...prev.director, [arrayName]: list } as DirectorPayload };
      });
    },
    []
  );

  // ── Laboratories ──────────────────────────────────────────────────────────
  const updateLabField = useCallback(
    (uid: string, field: "room_number" | "email" | "phone_number", value: string) => {
      setPayload((prev) => ({
        ...prev,
        laboratories: prev.laboratories.map((lab: any) => (lab.uid === uid ? { ...lab, [field]: value } : lab)),
      }));
    },
    []
  );

  const updateLabTranslatedField = useCallback(
    (uid: string, lang: "az" | "en", field: "title" | "html_content", value: string) => {
      setPayload((prev) => ({
        ...prev,
        laboratories: prev.laboratories.map((lab: any) =>
          lab.uid === uid ? { ...lab, [lang]: { ...lab[lang], [field]: value } } : lab
        ),
      }));
    },
    []
  );

  const addLabObjective = useCallback((labUid: string) => {
    setPayload((prev) => ({
      ...prev,
      laboratories: prev.laboratories.map((lab: any) =>
        lab.uid === labUid ? { ...lab, objectives: [...(lab.objectives ?? []), blankLaboratoryObjective()] } : lab
      ),
    }));
  }, []);

  const removeLabObjective = useCallback((labUid: string, objUid: string) => {
    setPayload((prev) => ({
      ...prev,
      laboratories: prev.laboratories.map((lab: any) =>
        lab.uid === labUid
          ? { ...lab, objectives: (lab.objectives ?? []).filter((o: any) => o.uid !== objUid) }
          : lab
      ),
    }));
  }, []);

  const updateLabObjective = useCallback((labUid: string, objUid: string, lang: "az" | "en", value: string) => {
    setPayload((prev) => ({
      ...prev,
      laboratories: prev.laboratories.map((lab: any) =>
        lab.uid === labUid
          ? {
              ...lab,
              objectives: (lab.objectives ?? []).map((o: any) =>
                o.uid === objUid ? { ...o, [lang]: { title: value } } : o
              ),
            }
          : lab
      ),
    }));
  }, []);

  const setLabGallery = useCallback((labUid: string, gallery: { id: number; image_url: string }[]) => {
    setPayload((prev) => ({
      ...prev,
      laboratories: prev.laboratories.map((lab: any) =>
        lab.uid === labUid ? { ...lab, gallery_images: gallery } : lab
      ),
    }));
  }, []);

  return {
    payload,
    setPayload,
    changeField,
    changeStatField,
    setFacultyCode,
    setSDGs,
    toggleSDG,
    addListItem,
    removeListItem,
    updateListItem,
    updateTranslatedListItem,
    changeDirectorField,
    changeDirectorLanguageField,
    updateDirectorResearchFields,
    addDirectorArrayItem,
    removeDirectorArrayItem,
    updateDirectorArrayItem,
    updateDirectorLanguageArrayItem,
    updateLabField,
    updateLabTranslatedField,
    addLabObjective,
    removeLabObjective,
    updateLabObjective,
    setLabGallery,
  };
}

export type CafedraPayloadApi = ReturnType<typeof useCafedraPayload>;
