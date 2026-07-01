import { Outlet } from "react-router";
import { ChatbotWidget } from "./ChatbotWidget";

export function AppShell() {
  return (
    <>
      <Outlet />
      <ChatbotWidget />
    </>
  );
}
