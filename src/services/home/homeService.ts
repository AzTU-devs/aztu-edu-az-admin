import apiClient from "../../util/apiClient";

/**
 * Home section ("Ana səhifə").
 *
 * The page is a singleton (page_key = "home") built from two ordered metric
 * lists — the hero badges and the "Rəqəmlərlə Universitetimiz" counters. Like
 * About, the whole document saves in one PUT (each list replaced wholesale), and
 * publishing is its own call so saving a draft never puts it live.
 */

/** One language's copy for a metric. `sublabel` is only used by the numbers group. */
export interface HomeMetricTranslation {
  label: string | null;
  sublabel: string | null;
}

/** One metric row as the admin reader returns it. */
export interface HomeMetric {
  id: number;
  display_order: number;
  /** Language-neutral: the same across every language. */
  value: string;
  suffix: string;
  az: HomeMetricTranslation;
  en: HomeMetricTranslation;
}

export interface HomePageDetail {
  page_key: string;
  is_active: boolean;
  hero_metrics: HomeMetric[];
  number_metrics: HomeMetric[];
}

/** One metric row in a save payload — no id, the server rebuilds the list. */
export interface HomeMetricForm {
  value: string;
  suffix: string;
  az: HomeMetricTranslation;
  en: HomeMetricTranslation;
}

/**
 * Whole-document save body. A key omitted leaves that list untouched; an empty
 * array clears it — the same convention About uses.
 */
export interface HomePagePayload {
  hero_metrics?: HomeMetricForm[];
  number_metrics?: HomeMetricForm[];
}

const BASE = "/api/home";

export const getHomePage = async () => {
  try {
    const response = await apiClient.get(`${BASE}/admin/pages/home`);
    if (response.data?.status_code === 200) {
      return response.data.page as HomePageDetail;
    }
    // A 404 means the row was never seeded — a different problem from the API
    // being unreachable, and the screen says so.
    return response.data?.status_code === 404 ? ("NOT FOUND" as const) : ("ERROR" as const);
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return status === 404 ? ("NOT FOUND" as const) : ("ERROR" as const);
  }
};

export const updateHomePage = async (payload: HomePagePayload) => {
  try {
    const response = await apiClient.put(`${BASE}/admin/pages/home`, payload);
    return response.data?.status_code === 200 ? ("SUCCESS" as const) : ("ERROR" as const);
  } catch {
    return "ERROR" as const;
  }
};

export const publishHomePage = async (isActive: boolean) => {
  try {
    const response = await apiClient.put(`${BASE}/admin/pages/home/publish`, {
      is_active: isActive,
    });
    return response.data?.status_code === 200 ? ("SUCCESS" as const) : ("ERROR" as const);
  } catch {
    return "ERROR" as const;
  }
};
