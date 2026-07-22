/**
 * The About dropdown's own grouping, mirrored into the dashboard.
 *
 * These are the four columns the public header renders, plus a catch-all for
 * the /about screens that are reachable but not listed in the dropdown
 * (rankings, HEI, MBA). Sidebar, index page and page editor all read from here
 * so the three can never drift apart.
 */

export const ABOUT_GROUP_ORDER = [
  "vision_mission",
  "leadership",
  "affiliated",
  "policies",
  "other",
  // Not part of the About dropdown — these are the Management section's
  // "Ofis və Mərkəzlər" screens. They share this registry and every block
  // editor with the About pages, but the sidebar lists them under İdarəetmə.
  "offices",
] as const;

export type AboutGroup = (typeof ABOUT_GROUP_ORDER)[number];

export const ABOUT_GROUP_LABELS: Record<AboutGroup, string> = {
  vision_mission: "Vizyon və Missiya",
  leadership: "Rəhbərlik və İdarəetmə",
  affiliated: "Bağlı Qurumlar",
  policies: "Siyasətlər və Sənədlər",
  other: "Digər səhifələr",
  offices: "İdarəetmə — Ofis və Mərkəzlər",
};

/**
 * The sidebar's copy of the page list.
 *
 * The index screen reads the real registry from the API; the sidebar is a
 * static menu like every other group here, so this mirrors the backend seed
 * (`app/scripts/seed_about_pages.py`). A page added to the database but not
 * here still opens fine at /about-pages — it just is not listed in the menu.
 */
export interface AboutNavPage {
  key: string;
  name: string;
  group: AboutGroup;
}

export const ABOUT_NAV_PAGES: AboutNavPage[] = [
  { key: "history", name: "AzTU-nun Tarixi", group: "vision_mission" },
  { key: "vision", name: "Vizyon", group: "vision_mission" },
  { key: "mission", name: "Missiya", group: "vision_mission" },
  { key: "strategic-plan", name: "Strateji İnkişaf Planı", group: "vision_mission" },
  { key: "anniversary-film", name: "75 İllik Yubiley Filmi", group: "vision_mission" },
  { key: "vision-mission-goal", name: "Vizyon, Missiya və Məqsəd", group: "vision_mission" },

  { key: "rector", name: "Rektor", group: "leadership" },
  { key: "vice-rector", name: "Prorektorlar", group: "leadership" },
  { key: "rectors-office", name: "Rektorat", group: "leadership" },
  { key: "scientific-board", name: "Elmi Şura", group: "leadership" },

  { key: "tau", name: "Türkiyə–Azərbaycan Universiteti", group: "affiliated" },
  { key: "iit", name: "İnformasiya Texnologiyaları İnstitutu", group: "affiliated" },
  { key: "ics", name: "İdarəetmə Sistemləri İnstitutu", group: "affiliated" },
  { key: "baku-technical-colleges", name: "Bakı Texniki Kolleci", group: "affiliated" },
  { key: "baku-state-colleges", name: "Bakı Dövlət Rabitə və Nəqliyyat Kolleci", group: "affiliated" },

  { key: "general-policies", name: "Ümumi Siyasətlər", group: "policies" },
  { key: "academic-policies", name: "Akademik Siyasətlər", group: "policies" },
  { key: "sustainability-policies", name: "Davamlılıq Siyasətləri", group: "policies" },
  { key: "procedure-guidelines", name: "Prosedurlar və Qaydalar", group: "policies" },
  { key: "sustainability-documents", name: "Davamlılıq Sənədləri", group: "policies" },
  { key: "accreditation", name: "Akkreditasiya", group: "policies" },

  { key: "rankings", name: "Beynəlxalq Reytinqlər", group: "other" },
  { key: "hei", name: "Yüksək Təhsil İnstitutu (YTİ)", group: "other" },
  { key: "mba", name: "MBA Proqramı", group: "other" },
];

/**
 * The Management dropdown's "Ofis və Mərkəzlər" half.
 *
 * Deliberately a separate list from ABOUT_NAV_PAGES: these pages live in the
 * same registry and use the same editor, but they belong to the header's
 * İdarəetmə section, so they must not appear under Haqqımızda in the sidebar.
 * The other half of that dropdown — Struktur bölmələr — is the departments
 * module, which was already dynamic.
 */
export const OFFICE_NAV_PAGES: AboutNavPage[] = [
  { key: "tto", name: "Texnoloji Transfer Ofisi", group: "offices" },
  { key: "qatim", name: "QATİM", group: "offices" },
  { key: "sabah-center", name: "SABAH Mərkəzi", group: "offices" },
  { key: "career-center", name: "Karyera və Məşğulluq Mərkəzi", group: "offices" },
  { key: "lifelong-learning", name: "Ömürboyu Təhsil Mərkəzi", group: "offices" },
  { key: "library", name: "Kitabxana-İnformasiya Mərkəzi", group: "offices" },
  { key: "nabran", name: "Nabran İstirahət Mərkəzi", group: "offices" },
];
