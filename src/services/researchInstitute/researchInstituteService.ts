import apiClient from "../../util/apiClient";

export interface InstituteLanguageSection {
  name: string;
  about_html: string;
  vision_html: string;
  mission_html: string;
  goals_html: string;
  direction_html: string;
}

export interface EducationSection {
  university_name: string;
  start_year: string;
  end_year: string;
  az: { degree: string };
  en: { degree: string };
}

export interface DirectorLanguageSection {
  scientific_name: string;
  scientific_degree: string;
  bio: string;
  researcher_areas: string;
}

export interface DirectorSection {
  first_name: string;
  last_name: string;
  father_name: string;
  email: string;
  room_number: string;
  az: DirectorLanguageSection;
  en: DirectorLanguageSection;
  educations: EducationSection[];
  profile_image?: string;
}

export interface StaffLanguageSection {
  scientific_name: string;
  scientific_degree: string;
}

export interface StaffSection {
  id?: number;
  first_name: string;
  last_name: string;
  father_name: string;
  email: string;
  phone_number: string;
  az: StaffLanguageSection;
  en: StaffLanguageSection;
  profile_image?: string;
}

export interface Institute {
  institute_code: string;
  name: string;
  staff_count: number;
}

export interface ResearchInstituteDetail {
  institute_code: string;
  image?: string;
  az: InstituteLanguageSection;
  en: InstituteLanguageSection;
  director: DirectorSection;
  staff: StaffSection[];
}

export interface CreateInstitutePayload {
  image?: string;
  az: InstituteLanguageSection;
  en: InstituteLanguageSection;
  director: DirectorSection;
  staff: StaffSection[];
}

const RESEARCH_INSTITUTE_BASE = "/api/research-institute";

export const getInstitutes = async (start: number, end: number) => {
  try {
    const response = await apiClient.get(`${RESEARCH_INSTITUTE_BASE}/admin/all?start=${start}&end=${end}`);

    if (response.data.status_code === 200) {
      return {
        institutes: response.data.institutes as Institute[],
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

export const createInstitute = async (payload: CreateInstitutePayload) => {
  try {
    const response = await apiClient.post(`${RESEARCH_INSTITUTE_BASE}/create`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data.status_code === 201) {
      return { status: "SUCCESS", institute: response.data.institute as ResearchInstituteDetail };
    }

    return { status: "ERROR" };
  } catch (err: any) {
    return { status: "ERROR" };
  }
};

export const updateInstitute = async (instituteCode: string, payload: Partial<CreateInstitutePayload>) => {
  try {
    const response = await apiClient.put(`${RESEARCH_INSTITUTE_BASE}/${instituteCode}`, payload, {
      headers: { "Content-Type": "application/json" },
    });

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

export const uploadDirectorImage = async (instituteCode: string, imageFile: File) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await apiClient.put(`${RESEARCH_INSTITUTE_BASE}/${instituteCode}/director/image`, formData, {
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
