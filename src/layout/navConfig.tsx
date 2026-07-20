import ApartmentIcon from '@mui/icons-material/Apartment';
import CampaignIcon from '@mui/icons-material/Campaign';
import CategoryIcon from '@mui/icons-material/Category';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';

import { GridIcon } from "../icons";

export type NavSubItem = {
  name: string;
  path: string;
};

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavSubItem[];
};

export type NavGroup = {
  label: string;
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
    label: "Elmi fəaliyyət",
    items: [
      {
        icon: <ScienceIcon />,
        name: "Tədqiqat Laboratoriyaları",
        subItems: [
          { name: "Laboratoriyalar", path: "/research-laboratories" },
          { name: "Yeni laboratoriya", path: "/research-laboratories/new" },
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
 */
export const findNavMatch = (pathname: string): NavMatch | null => {
  let match: NavMatch | null = null;
  let matchedLength = -1;

  navGroups.forEach((group) => {
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
