import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";

import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isMobileOpen, closeMobileSidebar, toggleSidebar } = useSidebar();
  const location = useLocation();

  // Navigating away is an implicit dismissal — without this the drawer stays
  // open on top of the page the user just asked for.
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  useEffect(() => {
    // ⌘B belongs to whatever the user is typing into first — the rich text
    // editor binds it to bold, and a plain input has its own text handling.
    const isTextEntry = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.isContentEditable) return true;
      if (target.closest(".ProseMirror")) return true;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileOpen) {
        closeMobileSidebar();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        if (event.defaultPrevented || isTextEntry(event.target)) return;
        event.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen, closeMobileSidebar, toggleSidebar]);

  return (
    <div
      className="min-h-screen lg:grid"
      style={{
        // Only the pinned state moves the content column. Hover-expansion floats
        // the rail over the page instead, so the layout never jumps.
        gridTemplateColumns: `${
          isExpanded ? "var(--sidebar-w)" : "var(--sidebar-w-collapsed)"
        } minmax(0, 1fr)`,
      }}
    >
      <AppSidebar />
      <Backdrop />
      <div className="flex min-w-0 flex-col">
        <AppHeader />
        <main className="w-full flex-1 mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
          <div key={location.pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
