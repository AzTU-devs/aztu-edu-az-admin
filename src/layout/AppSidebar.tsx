import { Link, useLocation } from "react-router";
import { useMemo, useState } from "react";

import {
  ChevronDownIcon,
  CloseIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import {
  filterNavGroups,
  findNavMatch,
  navItemKey,
  type NavGroup,
  type NavItem,
} from "./navConfig";
import useNavGroups from "./useNavGroups";

const AppSidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    closeMobileSidebar,
  } = useSidebar();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [collapsedItems, setCollapsedItems] = useState<string[]>([]);

  // Labels, the filter box and the submenus are all gated on the same thing:
  // is the rail showing its full width right now?
  const isOpen = isExpanded || isHovered || isMobileOpen;

  const visible = useNavGroups();

  const match = useMemo(
    () => findNavMatch(location.pathname, visible),
    [location.pathname, visible]
  );
  const groups = useMemo(() => filterNavGroups(visible, query), [visible, query]);

  // Both filters hand back cloned items, so identity has to be compared by key,
  // never by reference.
  const activeItemKey = match ? navItemKey(match.item) : null;
  const activeSubItemPath = match?.subItem?.path ?? null;

  /**
   * Submenus follow the route by default — the group owning the current page is
   * open, everything else is closed. Clicking only records a deviation from
   * that, keyed by path, so the state survives reordering the nav config.
   */
  const isSubmenuOpen = (item: NavItem) => {
    const key = navItemKey(item);
    const openByRoute = activeItemKey === key;
    const isToggled = collapsedItems.includes(key);
    // A filtered tree shows what it found, expanded.
    if (query.trim()) return true;
    return openByRoute ? !isToggled : isToggled;
  };

  const handleSubmenuToggle = (item: NavItem) => {
    const key = navItemKey(item);
    setCollapsedItems((prev) =>
      prev.includes(key) ? prev.filter((entry) => entry !== key) : [...prev, key]
    );
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-0.5">
      {items.map((nav) => {
        const isItemActive = activeItemKey === navItemKey(nav);
        const submenuOpen = nav.subItems ? isSubmenuOpen(nav) : false;

        return (
          <li key={navItemKey(nav)}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(nav)}
                aria-expanded={submenuOpen}
                title={isOpen ? undefined : nav.name}
                className={`menu-item group ${
                  isItemActive ? "menu-item-active" : "menu-item-inactive"
                } ${isOpen ? "lg:justify-start" : "lg:justify-center"}`}
              >
                {isItemActive && <span className="menu-item-rail" />}
                <span
                  className={`menu-item-icon-size ${
                    isItemActive ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {isOpen && (
                  <>
                    <span className="menu-item-text">{nav.name}</span>
                    <ChevronDownIcon
                      className={`ml-auto w-4 h-4 shrink-0 transition-transform duration-200 ${
                        submenuOpen
                          ? "rotate-180 text-brand-500 dark:text-brand-400"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    />
                  </>
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  title={isOpen ? undefined : nav.name}
                  className={`menu-item group ${
                    isItemActive ? "menu-item-active" : "menu-item-inactive"
                  } ${isOpen ? "lg:justify-start" : "lg:justify-center"}`}
                >
                  {isItemActive && <span className="menu-item-rail" />}
                  <span
                    className={`menu-item-icon-size ${
                      isItemActive ? "menu-item-icon-active" : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {isOpen && <span className="menu-item-text">{nav.name}</span>}
                </Link>
              )
            )}

            {nav.subItems && isOpen && (
              <div
                className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                style={{
                  gridTemplateRows: submenuOpen ? "1fr" : "0fr",
                  opacity: submenuOpen ? 1 : 0,
                }}
              >
                {/* The overflow wrapper is what makes the 0fr → 1fr row animate;
                    it replaces the old scrollHeight measurement, which went
                    stale whenever the submenu content changed while open. */}
                <div className="overflow-hidden">
                  <ul className="menu-dropdown-list">
                    {nav.subItems.map((subItem) => {
                      const isSubActive = activeSubItemPath === subItem.path;

                      return (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            className={`menu-dropdown-item ${
                              isSubActive
                                ? "menu-dropdown-item-active"
                                : "menu-dropdown-item-inactive"
                            }`}
                          >
                            <span className="menu-dropdown-dot" />
                            <span className="truncate">{subItem.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const renderGroup = (group: NavGroup) => (
    <div key={group.label}>
      <h2
        className={`menu-group-label ${isOpen ? "justify-start" : "lg:justify-center"}`}
      >
        {isOpen ? group.label : <HorizontaLDots className="size-4" />}
      </h2>
      {renderMenuItems(group.items)}
    </div>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-100 bg-white text-gray-900 transition-[width,transform] duration-300 ease-out lg:sticky lg:translate-x-0 dark:border-gray-800 dark:bg-gray-900
        ${isMobileOpen ? "translate-x-0 shadow-elevate" : "-translate-x-full"}
        ${!isExpanded && isHovered ? "lg:shadow-elevate" : ""}`}
      style={{
        width: isOpen ? "var(--sidebar-w)" : "var(--sidebar-w-collapsed)",
      }}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo area */}
      <div
        className={`flex h-(--header-h) shrink-0 items-center border-b border-gray-100 px-4 dark:border-gray-800 ${
          isOpen ? "justify-between" : "lg:justify-center"
        }`}
      >
        <Link to="/" className="flex min-w-0 items-center gap-2.5 overflow-hidden">
          {/*
            The mark is portrait (roughly 2873x3932). Tailwind's preflight forces
            `height: auto` on images, so sizing it by width lets the height run to
            ~85px and spill out of the header — constrain the height and let the
            width follow the aspect ratio instead.
          */}
          <img
            className="h-9 w-auto shrink-0 object-contain dark:hidden"
            src="/images/aztu-logo-dark.png"
            alt="AzTU"
          />
          <img
            className="hidden h-9 w-auto shrink-0 object-contain dark:block"
            src="/images/aztu-logo-light.png"
            alt="AzTU"
          />
          {isOpen && (
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-theme-sm font-semibold text-gray-900 dark:text-white">
                AzTU Admin
              </span>
              <span className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                aztu.edu.az
              </span>
            </span>
          )}
        </Link>

        {/* Drawer dismiss — the backdrop is not discoverable enough on its own. */}
        {isMobileOpen && (
          <button
            onClick={closeMobileSidebar}
            aria-label="Menyunu bağla"
            className="flex size-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-white/5"
          >
            <CloseIcon className="size-5" />
          </button>
        )}
      </div>

      {/* Nav filter */}
      {isOpen && (
        <div className="shrink-0 px-4 pt-4">
          <label className="sidebar-search">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                fill="currentColor"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Menyuda axtar..."
              aria-label="Menyuda axtar"
            />
          </label>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
        <div className="flex flex-col gap-6">
          {groups.map(renderGroup)}
          {groups.length === 0 && isOpen && (
            <p className="px-3 py-6 text-center text-theme-xs text-gray-400 dark:text-gray-500">
              Nəticə tapılmadı
            </p>
          )}
        </div>
      </nav>

      {/* Collapse hint */}
      {isOpen && (
        <div className="shrink-0 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <p className="text-[11px] text-gray-400 dark:text-gray-600">
            Menyunu yığmaq üçün <kbd className="kbd-hint">⌘B</kbd>
          </p>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
