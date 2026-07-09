import { Save } from "lucide-react";
import "./TwoFactorSection.css";

interface TwoFactorTranslations {
  title: string;
  subtitle: string;
  label: string;
  description: string;
  saveButton: string;
  saving: string;
  saveSuccess: string;
  saveError: string;
}

interface TwoFactorSectionProps {
  enabled: boolean;
  isSaving: boolean;
  onToggle: (value: boolean) => void;
  onSave: () => void;
  t: TwoFactorTranslations;
}

export function TwoFactorSection({
  enabled,
  isSaving,
  onToggle,
  onSave,
  t,
}: TwoFactorSectionProps) {
  return (
    <section className="twofactor-section" aria-label={t.title}>
      <div className="twofactor-section__header">
        <h2 className="twofactor-section__title">{t.title}</h2>
        <p className="twofactor-section__subtitle">{t.subtitle}</p>
      </div>

      <div className="twofactor-section__body">
        <div className="twofactor-section__row">
          <div className="twofactor-section__text">
            <span className="twofactor-section__label">{t.label}</span>
            <span className="twofactor-section__desc">{t.description}</span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            className={`twofactor-toggle${enabled ? " twofactor-toggle--on" : ""}`}
            onClick={() => onToggle(!enabled)}
            aria-label={t.label}
          >
            <span className="twofactor-toggle__thumb" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="twofactor-section__footer">
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
