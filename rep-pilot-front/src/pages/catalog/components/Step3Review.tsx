import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  createResource,
  type CreateResourcePayload,
} from "../../../shared/lib/resources/resourcesApi";
import { createTag, type Tag } from "../../../shared/lib/resources/tagsApi";
import { useTags } from "../../../shared/hooks/useTags";
import { toast } from "../../../shared/lib/toast/toastBus";
import type { ApiError } from "../../../shared/lib/apiClient";
import { isSessionExpiredError } from "../../../shared/lib/apiClient";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import { ResourceReviewCard, type ResourceDraft } from "./ResourceReviewCard";
import "./Step3Review.css";

interface Step3ReviewProps {
  drafts: ResourceDraft[];
  isIndividualMode: boolean;
  t: Translations["catalog"]["addResource"]["step3"];
  onBack: () => void;
  onDone: () => void;
}

export function Step3Review({
  drafts: initialDrafts,
  isIndividualMode,
  t,
  onBack,
  onDone,
}: Step3ReviewProps) {
  const [drafts, setDrafts] = useState<ResourceDraft[]>(initialDrafts);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [localTags, setLocalTags] = useState<Tag[]>([]);
  const { tags: fetchedTags } = useTags();

  const availableTags = [
    ...fetchedTags,
    ...localTags.filter((lt) => !fetchedTags.some((ft) => ft.id === lt.id)),
  ];

  const selectedDrafts = drafts.filter((d) => d.selected);
  const hasValidationError = selectedDrafts.some(
    (d) =>
      !(d.name ?? "").trim() ||
      !(d.description ?? "").trim() ||
      d.tags.length === 0,
  );

  function updateDraft(updated: ResourceDraft) {
    setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }

  async function handleCreateTag(name: string): Promise<Tag | null> {
    try {
      const created = await createTag({ name });
      setLocalTags((prev) => [...prev, created]);
      return created;
    } catch (err) {
      const apiErr = err as ApiError;
      if (isSessionExpiredError(err)) return null;
      if (apiErr.status === 409) {
        toast.error(`Tag "${name}" already exists.`);
      } else {
        toast.error(`Could not create tag "${name}".`);
      }
      return null;
    }
  }

  async function handleSubmit() {
    setShowValidation(true);
    if (hasValidationError) return;
    setSubmitting(true);
    setSubmitError(null);

    let successCount = 0;
    let failed = false;

    for (const draft of selectedDrafts) {
      const payload: CreateResourcePayload = {
        name: draft.name,
        type: draft.type,
        description: draft.description,
        gitUrl: draft.gitUrl,
        path: draft.path,
        tags: draft.tags,
      };
      try {
        await createResource(payload);
        successCount++;
      } catch {
        failed = true;
      }
    }

    setSubmitting(false);
    if (successCount > 0) toast.success(t.successMessage(successCount));
    if (failed) {
      setSubmitError(t.errorMessage);
    } else {
      onDone();
    }
  }

  return (
    <div className="step3">
      <p className="step3__count">{t.resourcesCount(selectedDrafts.length)}</p>

      {showValidation && hasValidationError && (
        <div className="step3__validation-banner" role="alert">
          <AlertTriangle size={14} aria-hidden="true" />
          <span>{t.validationError}</span>
        </div>
      )}

      {submitError && (
        <div className="step3__error-banner" role="alert">
          <AlertTriangle size={14} aria-hidden="true" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="step3__list">
        {drafts.map((draft) => (
          <ResourceReviewCard
            key={draft.id}
            draft={draft}
            showCheckbox={isIndividualMode}
            availableTags={availableTags}
            hasError={showValidation && draft.selected}
            onUpdate={updateDraft}
            onCreateTag={handleCreateTag}
            t={t}
          />
        ))}
      </div>

      <div className="add-resource-card__actions">
        <button
          type="button"
          className="add-resource-btn add-resource-btn--secondary"
          onClick={onBack}
          disabled={submitting}
        >
          {t.backButton}
        </button>
        <button
          type="button"
          className="add-resource-btn add-resource-btn--primary"
          onClick={handleSubmit}
          disabled={submitting || selectedDrafts.length === 0}
          aria-busy={submitting}
        >
          {submitting && (
            <span className="add-resource-spinner" aria-hidden="true" />
          )}
          {submitting ? t.submitting : t.submitButton}
        </button>
      </div>
    </div>
  );
}
