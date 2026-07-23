/**
 * Hand-written mirrors of the RBAC / activity-log API contract (plan §5).
 *
 * The backend builds JSONResponse by hand with a `status_code` key and no
 * response_model, so nothing here is generated — keep it in sync by hand.
 * Errors are always `{ status_code, message }`.
 */

export type Lang = "az" | "en";

export interface ApiError {
  status_code: number;
  message: string;
}

/** 403 body — the axios interceptor must NOT refresh on this. */
export interface PermissionDeniedError {
  status_code: 403;
  detail: string;
  required_permission: string;
}

export interface ApiData<T> {
  status_code: number;
  data: T;
  message?: string;
}

export interface ApiMessage {
  status_code: number;
  message: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/* ── roles & permissions ───────────────────────────────────────────────── */

export const SUPER_ADMIN_CODE = "super_admin" as const;

/** Role as embedded in /auth/me. */
export interface RoleRef {
  id: number;
  code: string;
  name_az: string;
  name_en: string;
  is_system: boolean;
}

/** Role as embedded in an admin-user list row — no `name_en`, no `is_system`. */
export interface AdminUserRoleRef {
  id: number;
  code: string;
  name_az: string;
}

export interface RoleListItem {
  id: number;
  code: string;
  name_az: string;
  name_en: string;
  description: string | null;
  is_system: boolean;
  user_count: number;
  /** null = implicit all (super_admin holds zero grant rows by design). */
  permission_count: number | null;
}

export interface RoleDetail {
  id: number;
  code: string;
  name_az: string;
  name_en: string;
  description: string | null;
  is_system: boolean;
  user_count: number;
  permissions: string[];
}

export interface PermissionItem {
  id: number;
  key: string;
  action: string;
  label_az: string;
  label_en: string;
}

export interface PermissionDomainGroup {
  domain: string;
  label_az: string;
  label_en: string;
  permissions: PermissionItem[];
}

export interface RoleCreatePayload {
  code: string;
  name_az: string;
  name_en: string;
  description: string;
  permissions: string[];
}

export interface RoleUpdatePayload {
  name_az: string;
  name_en: string;
  description: string;
}

/** Full replace, not a delta. */
export interface RolePermissionsUpdatePayload {
  permissions: string[];
}

export type PermissionsResponse = ApiData<PermissionDomainGroup[]>;
export type RoleListResponse = ApiData<RoleListItem[]>;
export type RoleDetailResponse = ApiData<RoleDetail>;
export type RoleCreateResponse = ApiData<{ id: number }>;

/* ── current admin ─────────────────────────────────────────────────────── */

export interface MeData {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string | null;
  role: RoleRef | null;
  is_super_admin: boolean;
  /** Empty when is_super_admin — is_super_admin governs, not this list. */
  permissions: string[];
  /**
   * Mirrors the server's PERMISSION_ENFORCEMENT_MODE. Under "audit" the route
   * guard warns and lets the render through instead of redirecting, so a
   * mis-mapped route cannot hide a screen the API would have allowed.
   */
  enforcement_mode?: EnforcementMode;
}

export type EnforcementMode = "audit" | "enforce";

export type MeResponse = ApiData<MeData>;

/* ── admin users ───────────────────────────────────────────────────────── */

export interface AdminUserListItem {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
  is_active: boolean;
  role: AdminUserRoleRef | null;
  created_at: string;
  last_login_at: string | null;
}

export interface AdminUserListQuery {
  page?: number;
  page_size?: number;
  q?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface AdminUserCreatePayload {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
  is_active: boolean;
}

/** profile_image is absent by design — it moves through its own upload endpoint. */
export interface AdminUserUpdatePayload {
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export interface AdminUserAssignRolePayload {
  role_id: number;
}

export interface AdminUserPasswordPayload {
  password: string;
}

export type AdminUserListResponse = ApiData<Paginated<AdminUserListItem>>;

/* ── activity log ──────────────────────────────────────────────────────── */

export type ActivityOutcome = "success" | "denied";

export interface ActivityItem {
  id: number;
  created_at: string;
  admin_user_id: number | null;
  admin_username: string;
  action_key: string;
  domain: string;
  /** Rendered at read time from action_key + target_label; never persisted. */
  message_az: string;
  message_en: string;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
  method: string;
  path: string;
  status_code: number;
  outcome: ActivityOutcome;
  ip: string | null;
  user_agent: string | null;
  /**
   * Coarse client type derived from the User-Agent server-side: browser, curl,
   * postman, python, bot … Advisory only — a User-Agent is client-supplied and
   * trivially spoofed, so this is what the caller *claimed* to be.
   */
  client: string | null;
  /** Correlates this row with the application log and the X-Request-ID header. */
  request_id: string | null;
  /** Sanitised and size-capped server-side; secrets are already "[redacted]". */
  request_body: unknown;
  response_body: unknown;
  meta: Record<string, string> | null;
}

export interface ActivityListQuery {
  page?: number;
  page_size?: number;
  admin_user_id?: number;
  domain?: string;
  action_key?: string;
  outcome?: ActivityOutcome;
  /** YYYY-MM-DD */
  date_from?: string;
  /** YYYY-MM-DD */
  date_to?: string;
  q?: string;
  lang?: Lang;
}

export interface ActivityFilterAdmin {
  id: number;
  username: string;
  last_login_at: string | null;
}

export interface ActivityFilterDomain {
  key: string;
  label_az: string;
  label_en: string;
}

export interface ActivityFilterAction {
  key: string;
  label_az: string;
  label_en: string;
}

export interface ActivityFilters {
  admins: ActivityFilterAdmin[];
  domains: ActivityFilterDomain[];
  actions: ActivityFilterAction[];
}

export type ActivityListResponse = ApiData<Paginated<ActivityItem>>;
export type ActivityFiltersResponse = ApiData<ActivityFilters>;

/* ── client-side permission helpers ────────────────────────────────────── */

/**
 * Mirror of the server's DOMAIN_LABELS. GET /api/permissions carries the same
 * labels but requires `roles.read`, so a screen every admin must reach (their
 * own profile) cannot depend on it. An unknown domain falls back to its key.
 */
export const PERMISSION_DOMAIN_LABELS_AZ: Record<string, string> = {
  news: "Xəbərlər",
  news_categories: "Xəbər kateqoriyaları",
  announcements: "Elanlar",
  hero: "Ana səhifə videosu",
  projects: "Layihələr",
  collaborations: "Əməkdaşlıqlar",
  employees: "Əməkdaşlar",
  faculties: "Fakültələr",
  cafedras: "Kafedralar",
  departments: "Şöbələr",
  research_institutes: "Elmi tədqiqat institutları",
  menu: "Menyu və altlıq",
  menu_header: "Başlıq menyusu",
  chatbot_knowledge: "Çatbot bilik bazası",
  search: "Axtarış",
  roles: "Rollar",
  admin_users: "Admin istifadəçilər",
  activity: "Fəaliyyət jurnalı",
};

export interface PermissionKeyGroup {
  domain: string;
  label_az: string;
  keys: string[];
}

/** Groups raw permission keys by their `domain.action` prefix, matrix order. */
export function groupPermissionKeys(keys: string[]): PermissionKeyGroup[] {
  const order = Object.keys(PERMISSION_DOMAIN_LABELS_AZ);
  const byDomain = new Map<string, string[]>();

  for (const key of [...keys].sort()) {
    const domain = key.split(".")[0];
    const bucket = byDomain.get(domain);
    if (bucket) bucket.push(key);
    else byDomain.set(domain, [key]);
  }

  return [...byDomain.entries()]
    .sort(([a], [b]) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
    })
    .map(([domain, domainKeys]) => ({
      domain,
      label_az: PERMISSION_DOMAIN_LABELS_AZ[domain] ?? domain,
      keys: domainKeys,
    }));
}

/** Mirrors the server: super admin short-circuits, never consults the list. */
export function hasPermission(me: MeData | null, key: string): boolean {
  if (!me || !me.is_active) return false;
  if (me.is_super_admin) return true;
  return me.permissions.includes(key);
}

export function hasAnyPermission(me: MeData | null, keys: string[]): boolean {
  if (!me || !me.is_active) return false;
  if (me.is_super_admin) return true;
  return keys.some((k) => me.permissions.includes(k));
}
