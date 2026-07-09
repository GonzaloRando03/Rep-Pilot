import { Save, Info } from "lucide-react";
import { FormInput } from "../../../shared/ui/FormInput/FormInput";
import "./LdapConfigSection.css";

interface LdapConfigTranslations {
  title: string;
  subtitle: string;
  fields: { url: string; bindDn: string };
  placeholders: { url: string; bindDn: string };
  descriptions: { url: string; bindDn: string };
  bindDnHelpText: string;
  saveButton: string;
  saving: string;
  required: string;
  saveSuccess: string;
  saveError: string;
}

interface LdapConfigSectionProps {
  url: string;
  bindDn: string;
  isSaving: boolean;
  errors: { url?: string; bindDn?: string };
  onUpdate: (field: "url" | "bindDn", value: string) => void;
  onSave: () => void;
  t: LdapConfigTranslations;
}

export function LdapConfigSection({
  url,
  bindDn,
  isSaving,
  errors,
  onUpdate,
  onSave,
  t,
}: LdapConfigSectionProps) {
  return (
    <section className="ldap-section" aria-label={t.title}>
      <div className="ldap-section__header">
        <h2 className="ldap-section__title">{t.title}</h2>
        <p className="ldap-section__subtitle">{t.subtitle}</p>
      </div>

      <div className="ldap-section__fields">
        <div className="ldap-section__field-group">
          <FormInput
            id="ldap-url"
            label={t.fields.url}
            value={url}
            onChange={(v) => onUpdate("url", v)}
            placeholder={t.placeholders.url}
            error={errors.url}
            autoComplete="off"
          />
          <p className="ldap-section__field-desc">{t.descriptions.url}</p>
        </div>

        <div className="ldap-section__field-group">
          <FormInput
            id="ldap-bindDn"
            label={t.fields.bindDn}
            value={bindDn}
            onChange={(v) => onUpdate("bindDn", v)}
            placeholder={t.placeholders.bindDn}
            error={errors.bindDn}
            autoComplete="off"
          />
          <p className="ldap-section__field-desc">{t.descriptions.bindDn}</p>
          <div className="ldap-section__help" role="note">
            <Info
              size={13}
              aria-hidden="true"
              className="ldap-section__help-icon"
            />
            <span>{t.bindDnHelpText}</span>
          </div>
        </div>
      </div>

      <div className="ldap-section__footer">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={onSave}
          disabled={isSaving}
          aria-busy={isSaving}
        >
          {isSaving ? (
            <span
              className="git-section__spinner"
              style={{ width: 14, height: 14, borderWidth: 2 }}
              aria-hidden="true"
            />
          ) : (
            <Save size={15} aria-hidden="true" />
          )}
          {isSaving ? t.saving : t.saveButton}
        </button>
      </div>
    </section>
  );
}
