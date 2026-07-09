import { Save } from "lucide-react";
import { FormInput } from "../../../shared/ui/FormInput/FormInput";
import "./OpenAIConfigSection.css";

interface OpenAIConfigTranslations {
  title: string;
  subtitle: string;
  fields: { url: string; token: string; model: string };
  placeholders: { url: string; token: string; model: string };
  saveButton: string;
  saving: string;
}

interface OpenAIConfigSectionProps {
  url: string;
  token: string;
  model: string;
  isSaving: boolean;
  onUpdate: (field: "url" | "token" | "model", value: string) => void;
  onSave: () => void;
  t: OpenAIConfigTranslations;
}

export function OpenAIConfigSection({
  url,
  token,
  model,
  isSaving,
  onUpdate,
  onSave,
  t,
}: OpenAIConfigSectionProps) {
  return (
    <section className="openai-section" aria-label={t.title}>
      <div className="openai-section__header">
        <h2 className="openai-section__title">{t.title}</h2>
        <p className="openai-section__subtitle">{t.subtitle}</p>
      </div>

      <div className="openai-section__fields">
        <FormInput
          id="openai-url"
          label={t.fields.url}
          value={url}
          onChange={(v) => onUpdate("url", v)}
          placeholder={t.placeholders.url}
          autoComplete="off"
        />
        <FormInput
          id="openai-token"
          label={t.fields.token}
          type="password"
          value={token}
          onChange={(v) => onUpdate("token", v)}
          placeholder={t.placeholders.token}
          autoComplete="new-password"
        />
        <FormInput
          id="openai-model"
          label={t.fields.model}
          value={model}
          onChange={(v) => onUpdate("model", v)}
          placeholder={t.placeholders.model}
          autoComplete="off"
        />
      </div>

      <div className="openai-section__footer">
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
