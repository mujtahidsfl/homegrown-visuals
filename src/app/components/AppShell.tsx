import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { ChatbotWidget } from "./ChatbotWidget";

export function AppShell() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    if (!id) return;

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Fallback for late-mounted sections
    const timeout = window.setTimeout(() => {
      const fallback = document.getElementById(id);
      if (fallback) {
        fallback.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [location.hash, location.pathname]);

  return (
    <>
      <Outlet />
      <ChatbotWidget />
    </>
  );
}
