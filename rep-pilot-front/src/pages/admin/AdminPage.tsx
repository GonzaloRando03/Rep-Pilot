import { useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAuth } from "../../shared/hooks/useAuth";
import { useConfig } from "../../shared/hooks/useConfig";
import { useLdapConfig } from "../../shared/hooks/useLdapConfig";
import { useUsers } from "../../shared/hooks/useUsers";
import { useTranslation } from "../../shared/hooks/useTranslation";
import { GitInstancesSection } from "./components/GitInstancesSection";
import { OpenAIConfigSection } from "./components/OpenAIConfigSection";
import { LdapConfigSection } from "./components/LdapConfigSection";
import { TwoFactorSection } from "./components/TwoFactorSection";
import { UsersSection } from "./components/UsersSection";
import "./AdminPage.css";

type AdminTab = "config" | "users";

export function AdminPage() {
  const { user } = useAuth();
  const t = useTranslation();
  const ta = t.admin;
  const [activeTab, setActiveTab] = useState<AdminTab>("config");

  const {
    gitInstances,
    openaiConfig,
    enableTwoFactor,
    isLoading,
    isSavingGit,
    isSavingOpenAI,
    isSavingTwoFactor,
    addInstance,
    removeInstance,
    updateInstance,
    saveGit,
    updateOpenAI,
    saveOpenAI,
    updateTwoFactor,
    saveTwoFactor,
  } = useConfig();

  const usersHook = useUsers();
  const ldap = useLdapConfig();

  if (!user?.isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-page__forbidden" role="alert">
          <ShieldOff size={40} aria-hidden="true" />
          <h2 className="admin-page__forbidden-title">{ta.forbidden.title}</h2>
          <p className="admin-page__forbidden-desc">
            {ta.forbidden.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <nav className="admin-tabs" aria-label={ta.tabsAriaLabel}>
        <button
          type="button"
          className={`admin-tab${activeTab === "config" ? " admin-tab--active" : ""}`}
          onClick={() => setActiveTab("config")}
        >
          {ta.tabs.config}
        </button>
        <button
          type="button"
          className={`admin-tab${activeTab === "users" ? " admin-tab--active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          {ta.tabs.users}
        </button>
      </nav>

      {activeTab === "config" && (
        <div className="admin-page__tab-content">
          <GitInstancesSection
            instances={gitInstances}
            isLoading={isLoading}
            isSaving={isSavingGit}
            onAdd={addInstance}
            onRemove={removeInstance}
            onUpdate={updateInstance}
            onSave={saveGit}
            t={ta.gitInstances}
          />
          <OpenAIConfigSection
            url={openaiConfig.url}
            token={openaiConfig.token}
            model={openaiConfig.model}
            isSaving={isSavingOpenAI}
            onUpdate={updateOpenAI}
            onSave={saveOpenAI}
            t={ta.openaiConfig}
          />
          <LdapConfigSection
            url={ldap.config.url}
            bindDn={ldap.config.bindDn}
            isSaving={ldap.isSaving}
            errors={ldap.errors}
            onUpdate={ldap.update}
            onSave={ldap.save}
            t={ta.ldapConfig}
          />
          <TwoFactorSection
            enabled={enableTwoFactor}
            isSaving={isSavingTwoFactor}
            onToggle={updateTwoFactor}
            onSave={saveTwoFactor}
            t={ta.twoFactorConfig}
          />
        </div>
      )}

      {activeTab === "users" && (
        <div className="admin-page__tab-content">
          <UsersSection hook={usersHook} t={ta.users} />
        </div>
      )}
    </div>
  );
}
