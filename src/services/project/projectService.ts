import apiClient from "../../util/apiClient";

export interface Project {
    id: number;
    bg_image?: string;
    project_id: string;
    display_order: number;
    title: string;
    desc: string;
    html_content: string;
    created_at: string;
    updated_at?: string;
}

export interface ReOrderProjectPayload {
    project_id: string;
    new_order: number;
}

export interface CreateProjectPayload {
  bg_image: File;
  az: {
    title: string;
    desc: string;
    content_html: string;
  };
  en: {
    title: string;
    desc: string;
    content_html: string;
  };
}

export const getProjects = async (start: number, end: number, lang: string) => {
    try {
        const response = await apiClient.get(`/api/project/all?start=${start}&end=${end}&lang=${lang}`);

        if (response.data.status_code === 200) {
            return {
                projects: response.data.projects,
                total: response.data.total
            };
        } else if (response.data.status_code === 204) {
            return "NO CONTENT";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        return "ERROR";
    }
}

export const getProjectDetails = async (projectId: string, lang: string) => {
    try {
        const response = await apiClient.get(`/api/project/${projectId}?lang=${lang}`);

        if (response.data.status_code === 200) {
            return response.data.project;
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return "NOT FOUND"
        } else {
            return "ERROR";
        }
    }
}


export const reorderProject = async (reOrderPaylod: ReOrderProjectPayload) => {
    try {
        const response = await apiClient.post("/api/project/reorder", reOrderPaylod);

        if (response.data.status_code === 200) {
            return "SUCCESS";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return "NOT FOUND";
        }
        return "ERROR";
    }
};

export const createProject = async (payload: CreateProjectPayload) => {
  try {
    const formData = new FormData();
    
    formData.append("bg_image", payload.bg_image);
    
    // AZ fields
    formData.append("az_title", payload.az.title);
    formData.append("az_desc", payload.az.desc);
    formData.append("az_content_html", payload.az.content_html);
    
    // EN fields
    formData.append("en_title", payload.en.title);
    formData.append("en_desc", payload.en.desc);
    formData.append("en_content_html", payload.en.content_html);

    const response = await apiClient.post("/api/project/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.status_code === 201) {
      return "SUCCESS";
    } else {
      return "ERROR";
    }
  } catch (err: any) {
    console.error(err);
    return "ERROR";
  }
};

export const deleteProject = async (projectId: string) => {
    try {
        const response = await apiClient.delete(`/api/project/${projectId}/delete`);

        if (response.data.status_code === 200) {
            return "SUCCESS";
        } else {
            return "ERROR";
        }
    } catch (err: any) {
        if (err.response && err.response.status === 404) {
            return "NOT FOUND";
        }
        return "ERROR";
    }
}