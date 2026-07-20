import { useSidebar } from "../context/SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, closeMobileSidebar } = useSidebar();

  // Kept mounted and faded with pointer-events, rather than unmounted — a hard
  // swap made the drawer look like it snapped rather than slid.
  return (
    <div
      onClick={closeMobileSidebar}
      aria-hidden="true"
      className={`fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out lg:hidden ${
        isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    />
  );
};

export default Backdrop;
