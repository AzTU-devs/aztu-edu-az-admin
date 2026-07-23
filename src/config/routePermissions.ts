/**
 * The single source of truth for "who may see which screen".
 *
 * Both the route guard (`RequirePermission`) and the sidebar/breadcrumb filter
 * (`useNavGroups`) read from here, so a page can never be reachable but hidden,
 * or listed but forbidden.
 *
 * The permission catalogue mints keys for *mutations* only (plan §6) — there is
 * no `news.read`. A listing screen is therefore gated on "holds any key in this
 * domain": an account that can do nothing in a domain has no reason to see it.
 * Creation screens are gated on the `.create` key alone.
 *
 * This is presentation only. Every request is re-authorised server side.
 */

const anyOf = (domain: string, actions: string[]) => actions.map((a) => `${domain}.${a}`);

const NEWS = anyOf("news", ["create", "update", "delete", "activate", "deactivate", "reorder"]);
const NEWS_CATEGORIES = anyOf("news_categories", ["create", "update", "delete"]);
const ANNOUNCEMENTS = anyOf("announcements", [
  "create",
  "update",
  "delete",
  "activate",
  "deactivate",
  "reorder",
  "upload_file",
]);
const HERO = anyOf("hero", ["create", "update", "delete", "activate", "deactivate"]);
const PROJECTS = anyOf("projects", ["create", "delete", "reorder"]);
const COLLABORATIONS = anyOf("collaborations", ["create", "update", "delete", "reorder"]);
const EMPLOYEES = anyOf("employees", ["create", "update", "delete"]);
const FACULTIES = anyOf("faculties", ["create", "update", "delete"]);
const CAFEDRAS = anyOf("cafedras", ["create", "update", "delete"]);
const DEPARTMENTS = anyOf("departments", ["create", "update", "delete"]);
const RESEARCH_INSTITUTES = anyOf("research_institutes", ["create", "update", "delete"]);
const RESEARCH_PROJECTS = anyOf("research_projects", ["create", "update", "delete"]);
const ABOUT = anyOf("about", ["update", "activate"]);
const MENU = anyOf("menu", ["footer_column.create", "footer_link.create", "partner_logo.create"]);
const MENU_HEADER = anyOf("menu_header", ["create", "update", "delete"]);

/**
 * Keyed by route path. Lookup is longest-prefix, so `/news/new` resolves to its
 * own entry rather than the one for `/news`.
 */
export const ROUTE_PERMISSIONS: Record<string, string | string[]> = {
  // Detail routes inherit this by longest-prefix, so /about/vision-mission-goal
  // is covered without an entry of its own.
  "/about": ABOUT,

  "/news": NEWS,
  "/news/new": "news.create",
  "/news-categories": NEWS_CATEGORIES,

  "/announcements": ANNOUNCEMENTS,
  "/announcements/new": "announcements.create",

  "/sliders": HERO,
  "/sliders/new": "hero.create",
  "/hero": HERO,

  "/projects": PROJECTS,
  "/projects/new": "projects.create",

  "/collaborations": COLLABORATIONS,
  "/collaborations/new": "collaborations.create",

  "/employees": EMPLOYEES,
  "/employees/new": "employees.create",

  "/faculties": FACULTIES,
  "/faculties/new": "faculties.create",

  "/cafedras": CAFEDRAS,
  "/cafedras/new": "cafedras.create",

  "/admin/departments": DEPARTMENTS,
  "/admin/departments/create": "departments.create",

  "/research-institutes": RESEARCH_INSTITUTES,
  "/research-institutes/new": "research_institutes.create",

  "/research-projects": RESEARCH_PROJECTS,
  "/research-projects/new": "research_projects.create",

  "/research-laboratories": CAFEDRAS,
  "/research-laboratories/new": "cafedras.laboratory.create",

  "/menu-header": MENU_HEADER,
  "/menu-footer": MENU,
  "/menu-quick": MENU,
  "/menu-shared": MENU,

  "/chat/sessions": "chat.read",
  "/chat/stats": "chat.read",

  "/settings/roles": "roles.read",
  "/settings/roles/new": "roles.create",
  "/settings/admin-users": "admin_users.read",
  "/settings/admin-users/new": "admin_users.create",
  "/settings/activity": "activity.read",
};

/**
 * Longest-prefix resolution, matching `isPathActive` semantics — `/news/12`
 * inherits the `/news` requirement. Unlisted paths (`/`, `/profile`, `/403`)
 * return undefined, which every consumer treats as "no permission required".
 */
export const permissionForPath = (pathname: string): string | string[] | undefined => {
  let best: string | string[] | undefined;
  let bestLength = -1;

  Object.entries(ROUTE_PERMISSIONS).forEach(([path, permission]) => {
    const matches = pathname === path || pathname.startsWith(`${path}/`);
    if (matches && path.length > bestLength) {
      best = permission;
      bestLength = path.length;
    }
  });

  return best;
};
