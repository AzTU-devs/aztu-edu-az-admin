import MenuIcon from '@mui/icons-material/Menu';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import { Link, useLocation } from "react-router";
import CampaignIcon from '@mui/icons-material/Campaign';
import HandshakeIcon from '@mui/icons-material/Handshake';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CollectionsIcon from '@mui/icons-material/Collections';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import ScienceIcon from '@mui/icons-material/Science';
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; name_az?: string; name_en?: string }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Əsas səhifə",
    path: "/"
  },
  {
    icon: <SmartDisplayIcon />,
    name: "Hero",
    path: "/hero",
  },
  {
    icon: <AccountTreeIcon />,
    name: "Layihələr",
    subItems: [
      { name: "Layihələr", path: "/projects" },
      { name: "Yeni layihə", path: "/projects/new" }
    ],
  },
  {
    icon: <CampaignIcon />,
    name: "Elanlar",
    subItems: [
      { name: "Elanlar", path: "/announcements" },
      { name: "Yeni elan", path: "/announcements/new" }
    ],
  },
  {
    name: "Xəbərlər",
    icon: <NewspaperIcon />,
    subItems: [
      { name: "Xəbərlər", path: "/news" },
      { name: "Yeni xəbər", path: "/news/new" },
      { name: "Xəbər kateqoriyaları", path: "/news-categories" }
    ],
  },
  {
    name: "Menyular",
    icon: <MenuIcon />,
    subItems: [
      { name: "Header", path: "/menu-header" },
      { name: "Footer", path: "/menu-footer" },
      { name: "Sürətli Menyu", path: "/menu-quick" },
      { name: "Paylaşılan", path: "/menu-shared" },
    ],
  },
  {
    icon: <SchoolIcon />,
    name: "Fakültələr",
    subItems: [
      { name: "Fakültələr", path: "/faculties" },
      { name: "Yeni fakültə", path: "/faculties/new" },
    ],
  },
  {
    icon: <ScienceIcon />,
    name: "Tədqiqat İnstitutları",
    subItems: [
      { name: "İnstitutlar", path: "/research-institutes" },
      { name: "Yeni institut", path: "/research-institutes/new" },
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
    icon: <CategoryIcon />,
    name: "Departamentlər",
    subItems: [
      { name: "Departamentlər", path: "/admin/departments" },
      { name: "Yeni departament", path: "/admin/departments/create" },
    ],
  },
  {
    icon: <PeopleIcon />,
    name: "İşçilər",
    subItems: [
      { name: "İşçilər", path: "/employees" },
      { name: "Yeni işçi", path: "/employees/new" },
    ],
  },
  {
    name: "Əməkdaşlıqlar",
    icon: <HandshakeIcon />,
    subItems: [
      { name: "Əməkdaşlıqlar", path: "/collaborations" },
      { name: "Yeni əməkdaşlıq", path: "/collaborations/new" },
    ],
  },
  {
    name: "Tədbirlər",
    icon: <EventNoteIcon />,
    path: "/events"
  },
  {
    name: "Qalereya",
    icon: <CollectionsIcon />,
    path: "/galery"
  },
  {
    name: "Konfranslar",
    icon: <ChatBubbleIcon />,
    path: "/conferences"
  },
];

const othersItems: NavItem[] = [
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-0.5">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              {openSubmenu?.type === menuType && openSubmenu?.index === index && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-500 rounded-r-full" />
              )}
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-4 h-4 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : "text-gray-400"
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                {isActive(nav.path) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-500 rounded-r-full" />
                )}
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-1 space-y-0.5 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-4 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-100 dark:border-gray-800
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Area */}
      <div
        className={`py-5 flex border-b border-gray-100 dark:border-gray-800 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/aztu-logo-dark.png"
                alt="Logo"
                width={70}
                height={36}
              />
              <img
                className="hidden dark:block"
                src="/images/aztu-logo-light.png"
                alt="Logo"
                width={70}
                height={36}
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-gray-900 dark:text-white leading-tight">AzTU Admin</span>
                <span className="text-[10px] text-gray-400 leading-tight">aztu.edu.az</span>
              </div>
            </>
          ) : (
            <>
              <img
                className="dark:hidden"
                src="/images/aztu-logo-dark.png"
                alt="Logo"
                width={38}
                height={38}
              />
              <img
                className="hidden dark:block"
                src="/images/aztu-logo-light.png"
                alt="Logo"
                width={38}
                height={38}
              />
            </>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar pt-4">
        <nav className="mb-6">
          <div className="flex flex-col gap-1">
            <div>
              <h2
                className={`mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider flex leading-[20px] text-gray-400 dark:text-gray-600 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Naviqasiya"
                ) : (
                  <HorizontaLDots className="size-4" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
