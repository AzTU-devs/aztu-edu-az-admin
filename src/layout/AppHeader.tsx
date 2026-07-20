import { useEffect, useMemo, useRef, useState } from "react";

import { Link, useLocation } from "react-router";
import { SIDEBAR_DESKTOP_BREAKPOINT, useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import GlobalSearch from "../components/header/GlobalSearch";
import { findNavMatch } from "./navConfig";

type Crumb = {
  label: string;
  path?: string;
  /** Group labels are context, not destinations — they drop out first. */
  muted?: boolean;
};

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const { isExpanded, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const location = useLocation();

  const handleToggle = () => {
    if (window.innerWidth >= SIDEBAR_DESKTOP_BREAKPOINT) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * The trail is derived from the same nav config the sidebar renders, so the
   * two can never disagree about where the user is. Routes outside the menu
   * (e.g. /profile) simply show the root crumb.
   */
  const crumbs = useMemo<Crumb[]>(() => {
    const trail: Crumb[] = [{ label: "Əsas səhifə", path: "/" }];
    const match = findNavMatch(location.pathname);

    if (!match || match.item.path === "/") return trail;

    trail.push({ label: match.group.label, muted: true });
    trail.push({ label: match.item.name, path: match.item.path });
    if (match.subItem) {
      trail.push({ label: match.subItem.name, path: match.subItem.path });
    }

    return trail;
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setApplicationMenuOpen(true);
        // The mobile panel mounts in the same tick; focusing the desktop input
        // is a no-op when it is hidden, and vice versa.
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // A route change means the answer to "where am I" changed — the transient
  // mobile search panel should not survive it.
  useEffect(() => {
    setApplicationMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex h-(--header-h) w-full items-center justify-between gap-3 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            className="header-icon-btn"
            onClick={handleToggle}
            aria-label="Menyunu aç/bağla"
            title="Menyunu aç/bağla (⌘B)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path d="M9.5 4.5v15" stroke="currentColor" strokeWidth="1.6" />
              {isExpanded && (
                <path d="M4.6 5.6h3.8v12.8H4.6z" fill="currentColor" opacity="0.35" />
              )}
            </svg>
          </button>

          {/* Mobile logo — the sidebar carrying the brand is off-canvas here. */}
          <Link to="/" className="shrink-0 lg:hidden" aria-label="AzTU Admin">
            <img
              className="h-7 dark:hidden"
              src="/images/aztu-logo-dark.png"
              alt="AzTU"
            />
            <img
              className="hidden h-7 dark:block"
              src="/images/aztu-logo-light.png"
              alt="AzTU"
            />
          </Link>

          {/* Breadcrumbs */}
          <nav aria-label="Naviqasiya izi" className="hidden min-w-0 sm:block">
            <ol className="flex min-w-0 items-center gap-1.5 text-theme-sm">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;

                return (
                  <li
                    key={`${crumb.label}-${index}`}
                    className={`flex min-w-0 items-center gap-1.5 ${
                      crumb.muted ? "hidden xl:flex" : ""
                    }`}
                  >
                    {index > 0 && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="shrink-0 text-gray-300 dark:text-gray-700"
                      >
                        <path
                          d="M9 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {isLast || !crumb.path ? (
                      <span
                        aria-current={isLast ? "page" : undefined}
                        className={`truncate ${
                          isLast
                            ? "font-medium text-gray-800 dark:text-gray-100"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.path}
                        className="truncate text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden lg:block">
            <GlobalSearch variant="desktop" inputRef={inputRef} />
          </div>

          <button
            className="header-icon-btn lg:hidden"
            onClick={toggleApplicationMenu}
            aria-label="Axtar"
            aria-expanded={isApplicationMenuOpen}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" fill="currentColor" />
            </svg>
          </button>

          <div className="mx-1 hidden h-5 w-px bg-gray-200 sm:block dark:bg-gray-800" />

          <ThemeToggleButton />
          <NotificationDropdown />

          <div className="mx-1 hidden h-5 w-px bg-gray-200 sm:block dark:bg-gray-800" />

          <UserDropdown />
        </div>
      </div>

      {/* Mobile search bar (expandable) */}
      {isApplicationMenuOpen && (
        <div className="absolute inset-x-0 top-(--header-h) border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden dark:border-gray-800 dark:bg-gray-900/95">
          <GlobalSearch
            variant="mobile"
            autoFocus
            onNavigate={() => setApplicationMenuOpen(false)}
          />
        </div>
      )}
    </header>
  );
};

export default AppHeader;
