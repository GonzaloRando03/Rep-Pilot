import { GitBranch, Plus, Save } from "lucide-react";
import { GitInstanceCard } from "./GitInstanceCard";
import type { GitInstance } from "../../../shared/lib/config/configApi";
import "./GitInstancesSection.css";

interface GitInstancesSectionTranslations {
  title: string;
  subtitle: string;
  addButton: string;
  saveButton: string;
  saving: string;
  emptyTitle: string;
  emptyDescription: string;
  instanceLabel: (n: number) => string;
  fields: { url: string; username: string; token: string };
  placeholders: { url: string; username: string; token: string };
  removeAriaLabel: string;
  loadingAriaLabel: string;
  saveSuccess: string;
  saveError: string;
  loadError: string;
}

interface GitInstancesSectionProps {
  instances: GitInstance[];
  isLoading: boolean;
  isSaving: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof GitInstance, value: string) => void;
  onSave: () => void;
  t: GitInstancesSectionTranslations;
}

export function GitInstancesSection({
  instances,
  isLoading,
  isSaving,
  onAdd,
  onRemove,
  onUpdate,
  onSave,
  t,
}: GitInstancesSectionProps) {
  return (
    <section className="git-section" aria-label={t.title}>
      <div className="git-section__header">
        <div className="git-section__title-block">
          <h2 className="git-section__title">{t.title}</h2>
          <p className="git-section__subtitle">{t.subtitle}</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--secondary"
          onClick={onAdd}
          disabled={isLoading || isSaving}
        >
          <Plus size={15} aria-hidden="true" />
          {t.addButton}
        </button>
      </div>

      <div
        className={`git-section__body${isLoading ? " git-section__body--loading" : ""}`}
      >
        {isLoading ? (
          <span
            className="git-section__spinner"
            role="status"
            aria-label={t.loadingAriaLabel}
          />
        ) : instances.length === 0 ? (
          <div className="git-section__empty">
            <GitBranch size={32} aria-hidden="true" />
            <p className="git-section__empty-title">{t.emptyTitle}</p>
            <p className="git-section__empty-desc">{t.emptyDescription}</p>
          </div>
        ) : (
          instances.map((instance, index) => (
            <GitInstanceCard
              key={instance.id}
              instance={instance}
              index={index}
              onUpdate={onUpdate}
              onRemove={onRemove}
              t={t}
            />
          ))
        )}
      </div>

      <div className="git-section__footer">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={onSave}
          disabled={isLoading || isSaving}
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
