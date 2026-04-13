import apiClient from "../../util/apiClient";

export interface MultilingualContent {
  content: string;
}

export interface ResearchArea {
  az: MultilingualContent;
  en: MultilingualContent;
  display_order: number;
}

export interface Objective {
  az: MultilingualContent;
  en: MultilingualContent;
  display_order: number;
}

export interface ResearchDirection {
  az: MultilingualContent;
  en: MultilingualContent;
  display_order: number;
}

export interface EducationMultilingual {
  university: string;
  degree: string;
}

export interface EducationEntry {
  az: EducationMultilingual;
  en: EducationMultilingual;
  start_year: string;
  end_year: string | null;
  display_order: number;
}

export interface PersonLanguageSection {
  title: string;
  biography: string;
}

export interface Director {
  id?: number | string;
  full_name: string;
  email: string;
  office: string;
  image_url?: string;
  az: PersonLanguageSection;
  en: PersonLanguageSection;
  educations: EducationEntry[];
  research_areas: ResearchArea[];
}

export interface StaffMemberLanguageSection {
  title: string;
}

export interface StaffMember {
  id?: number;
  full_name: string;
  email: string;
  phone: string;
  image_url?: string;
  display_order: number;
  az: StaffMemberLanguageSection;
  en: StaffMemberLanguageSection;
}

export interface InstituteLanguageSection {
  name: string;
  about: string;
  vision: string;
  mission: string;
}

export interface ResearchInstituteDetail {
  institute_code: string;
  image_url?: string;
  az: InstituteLanguageSection;
  en: InstituteLanguageSection;
  director: Director;
  objectives: Objective[];
  research_directions: ResearchDirection[];
  staff: StaffMember[];
}

export interface CreateResearchInstitute {
  institute_code: string;
  image_url?: string;
  az: InstituteLanguageSection;
  en: InstituteLanguageSection;
  director: Director;
  objectives: Objective[];
  research_directions: ResearchDirection[];
  staff: StaffMember[];
}

export interface UpdateResearchInstitute extends Partial<CreateResearchInstitute> {}

export interface InstituteListItem {
  institute_code: string;
  name: string;
  staff_count: number;
}

const RESEARCH_INSTITUTE_BASE = "/api/research-institute";

export const getInstitutes = async (start: number, end: number, lang: string = "az") => {
  try {
    const response = await apiClient.get(`${RESEARCH_INSTITUTE_BASE}/admin/all?start=${start}&end=${end}&lang=${lang}`);

    if (response.data.status_code === 200) {
      return {
        institutes: response.data.data as InstituteListItem[],
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

export const getInstituteDetails = async (instituteCode: string) => {
  try {
    const response = await apiClient.get(`${RESEARCH_INSTITUTE_BASE}/${instituteCode}`);

    if (response.data.status_code === 200) {
      return response.data.institute as ResearchInstituteDetail;
    }

    return "ERROR";
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      return "NOT FOUND";
    }
    return "ERROR";
  }
};

export const createInstitute = async (payload: CreateResearchInstitute) => {
  try {
    const response = await apiClient.post(`${RESEARCH_INSTITUTE_BASE}/create`, payload);

    if (response.data.status_code === 201) {
      return { status: "SUCCESS", institute: response.data.institute as ResearchInstituteDetail };
    }

    return { status: "ERROR" };
  } catch (err: any) {
    return { status: "ERROR" };
  }
};

export const updateInstitute = async (instituteCode: string, payload: UpdateResearchInstitute) => {
  try {
    const response = await apiClient.patch(`${RESEARCH_INSTITUTE_BASE}/${instituteCode}`, payload);

    if (response.data.status_code === 200) {
      return { status: "SUCCESS", institute: response.data.institute as ResearchInstituteDetail };
    }

    return { status: "ERROR" };
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      return { status: "NOT FOUND" };
    }
    return { status: "ERROR" };
  }
};

export const deleteInstitute = async (instituteCode: string) => {
  try {
    const response = await apiClient.delete(`${RESEARCH_INSTITUTE_BASE}/${instituteCode}`);

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

export const uploadInstituteImage = async (instituteCode: string, imageFile: File) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await apiClient.put(`${RESEARCH_INSTITUTE_BASE}/${instituteCode}/image`, formData, {
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

export const uploadDirectorImage = async (directorId: number | string, imageFile: File) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await apiClient.put(`${RESEARCH_INSTITUTE_BASE}/director/${directorId}/image`, formData, {
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

export const uploadStaffImage = async (staffId: number, imageFile: File) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await apiClient.put(`${RESEARCH_INSTITUTE_BASE}/staff/${staffId}/image`, formData, {
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

