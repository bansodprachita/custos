import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close the drawer automatically on route change, so navigating on
  // mobile doesn't leave the sidebar open over the new page.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Backdrop — mobile only, closes the drawer on tap-outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="lg:ml-64 pt-24 px-4 sm:px-container-padding pb-container-padding min-h-screen">
        <div className="max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
