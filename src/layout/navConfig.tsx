import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BiotechIcon from '@mui/icons-material/Biotech';
import CampaignIcon from '@mui/icons-material/Campaign';
import InfoIcon from '@mui/icons-material/Info';
import CategoryIcon from '@mui/icons-material/Category';
import ForumIcon from '@mui/icons-material/Forum';
import MenuIcon from '@mui/icons-material/Menu';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';
import SettingsIcon from '@mui/icons-material/Settings';

import { GridIcon } from "../icons";
import { permissionForPath } from "../config/routePermissions";

/**
 * `permission` is optional everywhere. When omitted, the entry inherits the
 * requirement its `path` carries in `routePermissions` — the same map the route
 * guard consults, so the sidebar can never advertise a screen that /403s.
 * A string array means "any of".
 */
export type NavSubItem = {
  name: string;
  path: string;
  permission?: string | string[];
};

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string | string[];
  subItems?: NavSubItem[];
};

export type NavGroup = {
  label: string;
  permission?: string | string[];
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Ümumi",
    items: [
      {
        icon: <GridIcon />,
        name: "Əsas səhifə",
        path: "/",
      },
    ],
  },
  {
    /*
      The public site's "Haqqımızda" dropdown. One entry per screen — the pages
      are hand-listed rather than fetched, like every other group here.
    */
    label: "Haqqımızda",
    items: [
      {
        icon: <InfoIcon />,
        name: "Haqqımızda",
        subItems: [
          { name: "Rektor", path: "/about/rector" },
          { name: "Prorektorlar", path: "/about/vice-rector" },
          { name: "Elmi Şura", path: "/about/scientific-board" },
          { name: "Sabiq Rektorlarımız", path: "/about/former-rectors" },
          { name: "Vizyon, Missiya və Məqsəd", path: "/about/vision-mission-goal" },
          { name: "AzTU-nun Tarixi", path: "/about/history" },
          { name: "Strateji İnkişaf Planı", path: "/about/strategic-plan" },
        ],
      },
      {
        icon: <AccountBalanceIcon />,
        name: "Tərəfdaş Universitet və Əlaqəli İnstitutlar",
        subItems: [
          {
            name: "Türkiyə-Azərbaycan Universiteti",
            path: "/about/turkiye-azerbaijan-university",
          },
          {
            name: "İnformasiya Texnologiyaları İnstitutu",
            path: "/about/institute-of-information-technologies",
          },
          {
            name: "İdarəetmə Sistemləri İnstitutu",
            path: "/about/management-systems-institute",
          },
          { name: "Bakı Texniki Kolleci", path: "/about/baku-technical-college" },
          {
            name: "Bakı Dövlət Rabitə və Nəqliyyat Kolleci",
            path: "/about/baku-state-college-of-communication-and-transport",
          },
        ],
      },
    ],
  },
  {
    label: "Məzmun",
    items: [
      {
        icon: <CampaignIcon />,
        name: "Elanlar",
        subItems: [
          { name: "Elanlar", path: "/announcements" },
          { name: "Yeni elan", path: "/announcements/new" },
        ],
      },
      {
        icon: <NewspaperIcon />,
        name: "Xəbərlər",
        subItems: [
          { name: "Xəbərlər", path: "/news" },
          { name: "Yeni xəbər", path: "/news/new" },
          { name: "Xəbər kateqoriyaları", path: "/news-categories" },
        ],
      },
    ],
  },
  {
    label: "Akademik struktur",
    items: [
      {
        icon: <SchoolIcon />,
        name: "Fakültələr",
        subItems: [
          { name: "Fakültələr", path: "/faculties" },
          { name: "Yeni fakültə", path: "/faculties/new" },
        ],
      },
      {
        icon: <CategoryIcon />,
        name: "Kafedralar",
        subItems: [
          { name: "Kafedralar", path: "/cafedras" },
          { name: "Yeni kafedra", path: "/cafedras/new" },
        ],
      },
      {
        icon: <ApartmentIcon />,
        name: "Departamentlər",
        subItems: [
          { name: "Departamentlər", path: "/admin/departments" },
          { name: "Yeni departament", path: "/admin/departments/create" },
        ],
      },
    ],
  },
  {
    label: "Tədqiqat",
    items: [
      {
        /*
          The section's editorial pages, listed exactly like "Haqqımızda" above:
          one entry per screen, hand-listed rather than fetched. The entries
          below it manage entities (institutes, labs, projects), which is why
          this one is kept separate rather than folded in with them.
        */
        icon: <ArticleIcon />,
        name: "Tədqiqat",
        subItems: [
          { name: "Tədqiqat Prioritetləri", path: "/research/research-priorities" },
          {
            name: "Əqli Mülkiyyət və Patentlər",
            path: "/research/intellectual-property",
          },
        ],
      },
      {
        icon: <BiotechIcon />,
        name: "Tədqiqat İnstitutları",
        subItems: [
          { name: "İnstitutlar", path: "/research-institutes" },
          { name: "Yeni institut", path: "/research-institutes/new" },
        ],
      },
      {
        icon: <ScienceIcon />,
        name: "Tədqiqat Laboratoriyaları",
        subItems: [
          { name: "Laboratoriyalar", path: "/research-laboratories" },
          { name: "Yeni laboratoriya", path: "/research-laboratories/new" },
        ],
      },
      {
        icon: <AssignmentIcon />,
        name: "Tədqiqat Layihələri",
        subItems: [
          { name: "Layihələr", path: "/research-projects" },
          { name: "Yeni layihə", path: "/research-projects/new" },
        ],
      },
    ],
  },
  {
    /*
      Only the header menu is listed. The footer/quick/shared editors exist and
      are routed, but they still read the public `/api/menu/footer` and
      `/api/menu/quick` payloads, which resolve a single language and carry no
      row ids — nothing an editor can save against. They stay unlisted until
      they get admin readers of their own, the way the header just did.
    */
    label: "Naviqasiya",
    items: [
      {
        icon: <MenuIcon />,
        name: "Menyu",
        subItems: [{ name: "Header menyu", path: "/menu-header" }],
      },
    ],
  },
  {
    label: "Çatbot",
    permission: "chat.read",
    items: [
      {
        icon: <ForumIcon />,
        name: "Çat monitorinqi",
        permission: "chat.read",
        subItems: [
          { name: "Söhbətlər", path: "/chat/sessions", permission: "chat.read" },
          { name: "Statistika", path: "/chat/stats", permission: "chat.read" },
        ],
      },
    ],
  },
  {
    /*
      The whole group disappears for an account holding none of the three keys,
      rather than showing a heading over an empty list. Each child still carries
      its own key so a viewer granted only `activity.read` sees the log alone.
    */
    label: "Parametrlər",
    permission: ["roles.read", "admin_users.read", "activity.read"],
    items: [
      {
        icon: <SettingsIcon />,
        name: "Parametrlər",
        subItems: [
          { name: "Rollar", path: "/settings/roles", permission: "roles.read" },
          {
            name: "İstifadəçilər",
            path: "/settings/admin-users",
            permission: "admin_users.read",
          },
          {
            name: "Fəaliyyət jurnalı",
            path: "/settings/activity",
            permission: "activity.read",
          },
        ],
      },
    ],
  },
];

/**
 * A nav entry is active for its own URL and for anything nested under it, so
 * detail routes such as `/news/12` keep their parent highlighted. The root
 * entry is the exception — it only ever matches itself.
 */
export const isPathActive = (pathname: string, path: string): boolean =>
  path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

/**
 * Stable identity for an item — its own path, else its name. Deliberately blind
 * to `subItems`, because filtering the tree clones items with a trimmed child
 * list and the clone has to keep answering to the same key as the original.
 */
export const navItemKey = (item: NavItem): string => item.path ?? item.name;

export type NavMatch = {
  group: NavGroup;
  item: NavItem;
  subItem?: NavSubItem;
};

/**
 * Resolves a pathname to the single deepest nav entry that owns it. The longest
 * matching path wins, so `/news/new` picks "Yeni xəbər" rather than "Xəbərlər".
 * Returns null for routes that are reachable but not in the menu (e.g. /profile).
 *
 * Takes the groups to search rather than closing over `navGroups`, so callers
 * can pass the permission-filtered tree. Header breadcrumbs would otherwise name
 * sections the sidebar deliberately hides.
 */
export const findNavMatch = (
  pathname: string,
  groups: NavGroup[] = navGroups
): NavMatch | null => {
  let match: NavMatch | null = null;
  let matchedLength = -1;

  groups.forEach((group) => {
    group.items.forEach((item) => {
      if (item.path && isPathActive(pathname, item.path) && item.path.length > matchedLength) {
        match = { group, item };
        matchedLength = item.path.length;
      }
      item.subItems?.forEach((subItem) => {
        if (isPathActive(pathname, subItem.path) && subItem.path.length > matchedLength) {
          match = { group, item, subItem };
          matchedLength = subItem.path.length;
        }
      });
    });
  });

  return match;
};

/** Case/diacritic-insensitive contains, so "fakulte" finds "Fakültələr". */
const normalize = (value: string) =>
  value.toLocaleLowerCase("az").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * Filters the tree for the sidebar search box. A group is kept when its label
 * matches, an item when its own name matches (children kept intact), otherwise
 * only the children that match survive.
 */
export const filterNavGroups = (groups: NavGroup[], query: string): NavGroup[] => {
  const needle = normalize(query.trim());
  if (!needle) return groups;

  return groups
    .map((group) => {
      if (normalize(group.label).includes(needle)) return group;

      const items = group.items.reduce<NavItem[]>((acc, item) => {
        if (normalize(item.name).includes(needle)) {
          acc.push(item);
          return acc;
        }
        const subItems = item.subItems?.filter((subItem) =>
          normalize(subItem.name).includes(needle)
        );
        if (subItems?.length) {
          acc.push({ ...item, subItems });
        }
        return acc;
      }, []);

      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
};

/**
 * Hides what the current session may not open. An entry's requirement is its own
 * `permission`, else the one its `path` carries in `routePermissions`. A parent
 * with subItems is kept when any child survives, so a partially-granted domain
 * still shows the pages it does allow.
 *
 * Clones with `{ ...item, subItems }` exactly as `filterNavGroups` does — clones
 * keep the same `navItemKey`, which is what active-state highlighting compares.
 */
export const filterNavByPermission = (
  groups: NavGroup[],
  can: (permission: string | string[] | undefined) => boolean
): NavGroup[] => {
  const allows = (
    explicit: string | string[] | undefined,
    path: string | undefined
  ): boolean => can(explicit ?? (path ? permissionForPath(path) : undefined));

  return groups
    .filter((group) => can(group.permission))
    .map((group) => {
      const items = group.items.reduce<NavItem[]>((acc, item) => {
        if (item.subItems?.length) {
          const subItems = item.subItems.filter((subItem) =>
            allows(subItem.permission, subItem.path)
          );
          if (subItems.length && allows(item.permission, undefined)) {
            acc.push({ ...item, subItems });
          }
          return acc;
        }

        if (allows(item.permission, item.path)) {
          acc.push(item);
        }
        return acc;
      }, []);

      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
};
