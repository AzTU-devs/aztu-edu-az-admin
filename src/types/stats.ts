import type { ActivityItem, ApiData } from "./rbac";

/** Plain content row counts. Every key is always present, never null. */
export interface DashboardContentCounts {
  news: number;
  announcements: number;
  projects: number;
  sliders: number;
  gallery_images: number;
  header_menu_items: number;
  footer_menu_items: number;
  collaborators: number;
}

export interface DashboardAcademicCounts {
  faculties: number;
  cafedras: number;
  employees: number;
  research_institutes: number;
  /** Faculty labs + cafedra labs summed server-side; not one table. */
  research_laboratories: number;
}

export interface DashboardAdmins {
  total: number;
  active: number;
  recent_activity: ActivityItem[];
}

/** One entity's 12-month column, aligned index-for-index with `months`. */
export interface PublishingTrendSeries {
  key: string;
  data: number[];
  total: number;
}

export interface PublishingTrend {
  /** Oldest first, "YYYY-MM". */
  months: string[];
  series: PublishingTrendSeries[];
}

export interface VisitorWindow {
  views: number;
  uniques: number;
}

export interface VisitorDay {
  day: string;
  views: number;
  uniques: number;
}

export interface DashboardVisitors {
  today: VisitorWindow;
  last_7_days: VisitorWindow;
  last_30_days: VisitorWindow;
  daily: VisitorDay[];
}

export interface DashboardStats {
  generated_at: string;
  content: DashboardContentCounts;
  academic: DashboardAcademicCounts;
  admins: DashboardAdmins;
  publishing_trend: PublishingTrend;
  visitors: DashboardVisitors;
  /**
   * Panels whose query failed server-side (e.g. "activity" when its table has
   * not been migrated yet). Those sections must say so rather than render a
   * zero, which would read as real data.
   */
  unavailable?: string[];
}

export type DashboardStatsResponse = ApiData<DashboardStats>;

export interface DashboardStatsQuery {
  activity_limit?: number;
}

/** Azerbaijani labels for the publishing-trend series keys. */
export const TREND_SERIES_LABELS_AZ: Record<string, string> = {
  news: "Xəbərlər",
  announcements: "Elanlar",
  projects: "Layihələr",
  sliders: "Slayderlər",
  collaborators: "Əməkdaşlıqlar",
};
