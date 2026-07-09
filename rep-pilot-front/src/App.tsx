import { useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AppShell } from "./shared/layout/AppShell/AppShell";
import { Sidebar } from "./shared/layout/Sidebar/Sidebar";
import type { NavItem } from "./shared/layout/Sidebar/Sidebar";
import { Topbar } from "./shared/layout/Topbar/Topbar";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { CatalogPage } from "./pages/catalog/CatalogPage";
import { ResourceDetailPage } from "./pages/resource/ResourceDetailPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { EmptyState } from "./shared/ui/EmptyState/EmptyState";
import { LoginPage } from "./pages/login/LoginPage";
import { ForcedTwoFactorSetupPage } from "./pages/login/ForcedTwoFactorSetupPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { IaKitPage } from "./pages/ia-kit/IaKitPage";
import { useAuth } from "./shared/hooks/useAuth";
import { useTranslation } from "./shared/hooks/useTranslation";
import "./App.css";

function App() {
  const {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    updateLanguage,
    requiresTwoFactor,
    clearTwoFactor,
    requiresTwoFactorSetup,
    completeForcedSetup,
  } = useAuth();
  const t = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const NAV_ITEMS: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      {
        key: "dashboard",
        path: "/dashboard",
        label: t.nav.dashboard,
        icon: LayoutDashboard,
      },
      {
        key: "catalog",
        path: "/catalog",
        label: t.nav.catalogo,
        icon: BookOpen,
      },
      { key: "ia-kit", path: "/ia-kit", label: t.nav.iaKit, icon: Sparkles },
      {
        key: "documentation",
        path: "/documentation",
        label: t.nav.documentation,
        icon: FileText,
        externalUrl: "https://reppilot.gran-ser.com/",
      },
    ];
    if (user?.isAdmin) {
      items.push({
        key: "admin",
        path: "/admin",
        label: t.nav.admin,
        icon: ShieldCheck,
      });
    }
    return items;
  }, [t, user?.isAdmin]);

  const title = useMemo(() => {
    if (pathname.startsWith("/resources/")) return t.resourceDetail.pageTitle;
    if (pathname === "/profile") return t.profile.pageTitle;
    return NAV_ITEMS.find((item) => item.path === pathname)?.label ?? pathname;
  }, [pathname, t]);

  function handleSearch(query: string) {
    if (!query) return;
    navigate(`/catalog?search=${encodeURIComponent(query)}`);
  }

  if (requiresTwoFactorSetup) {
    return (
      <ForcedTwoFactorSetupPage
        onComplete={completeForcedSetup}
        onLogout={logout}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={login}
        isLoading={isLoading}
        requiresTwoFactor={requiresTwoFactor}
        onBackFromTwoFactor={clearTwoFactor}
      />
    );
  }

  return (
    <AppShell
      sidebar={
        <Sidebar
          items={NAV_ITEMS}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      }
    >
      <Topbar
        title={title}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
        onLogout={logout}
        onLanguageChange={updateLanguage}
        onSearch={handleSearch}
        onProfile={() => navigate("/profile")}
      />
      <section className="content-area" aria-live="polite">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/resources/:id" element={<ResourceDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ia-kit" element={<IaKitPage />} />
          <Route
            path="/documentation"
            element={
              <EmptyState
                title={t.nav.documentation}
                description={t.app.emptyState.description}
                action={{ label: t.app.emptyState.action }}
              />
            }
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </section>
    </AppShell>
  );
}

export default App;
