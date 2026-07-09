import type { ReactNode } from "react";
import "./AppShell.css";

interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="app-shell">
      {sidebar}
      <main className="main-content">{children}</main>
    </div>
  );
}
