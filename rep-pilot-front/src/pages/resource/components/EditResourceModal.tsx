import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  updateResource,
  type ResourceDetail,
} from "../../../shared/lib/resources/resourcesApi";
import { createTag, type Tag } from "../../../shared/lib/resources/tagsApi";
import type { ApiError } from "../../../shared/lib/apiClient";
import { isSessionExpiredError } from "../../../shared/lib/apiClient";
import { useTags } from "../../../shared/hooks/useTags";
import { toast } from "../../../shared/lib/toast/toastBus";
import "./EditResourceModal.css";

interface EditResourceModalProps {
  resource: ResourceDetail;
  onClose: () => void;
  onUpdated: () => void;
  t: {
    edit: string;
    saveButton: string;
    saving: string;
    cancel: string;
    nameLabel: string;
    namePlaceholder: string;
    nameRequired: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    tagsLabel: string;
    tagsPlaceholder: string;
    success: string;
    forbidden: string;
    error: string;
    removeTagAriaLabel: (name: string) => string;
    addTagAriaLabel: string;
    addTagButton: string;
    noTagsFound: string;
    newTagPlaceholder: string;
    createTagButton: string;
  };
}

interface FormState {
  name: string;
  description: string;
  tags: string[];
}

export function EditResourceModal({
  resource,
  onClose,
  onUpdated,
  t,
}: EditResourceModalProps) {
  const { tags, isLoading: tagsLoading } = useTags();
  const nameRef = useRef<HTMLInputElement>(null);
  const addTagRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>({
    name: resource.name,
    description: resource.description,
    tags: resource.tags.map((tag) => tag.id),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [addTagOpen, setAddTagOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [newTag, setNewTag] = useState("");
  const [creating, setCreating] = useState(false);
  const [localTags, setLocalTags] = useState<Tag[]>([]);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!addTagOpen) return;
    function handleClick(e: MouseEvent) {
      if (addTagRef.current && !addTagRef.current.contains(e.target as Node)) {
        setAddTagOpen(false);
        setTagSearch("");
        setNewTag("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [addTagOpen]);

  const mergedTags = [
    ...tags,
    ...localTags.filter((lt) => !tags.some((ft) => ft.id === lt.id)),
  ];

  const availableTags = mergedTags.filter((t) => !form.tags.includes(t.id));
  const filteredAvailable = availableTags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  async function handleCreateTag() {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const created = await createTag({ name: trimmed });
      setLocalTags((prev) => [...prev, created]);
      addTag(created.id);
      setNewTag("");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (isSessionExpiredError(err)) return;
      if (apiErr.status === 409) {
        toast.error(`La etiqueta "${trimmed}" ya existe.`);
      } else {
        toast.error(`No se pudo crear la etiqueta "${trimmed}".`);
      }
    } finally {
      setCreating(false);
    }
  }

  function removeTag(id: string) {
    setForm((s) => ({ ...s, tags: s.tags.filter((t) => t !== id) }));
  }

  function addTag(id: string) {
    setForm((s) => ({ ...s, tags: [...s.tags, id] }));
    setTagSearch("");
    setAddTagOpen(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError(t.nameRequired);
      return;
    }
    setNameError(null);
    setIsSaving(true);

    try {
      await updateResource(resource.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        tags: form.tags,
      });
      toast.success(t.success);
      onUpdated();
      onClose();
    } catch (err: unknown) {
      const apiError = err as { status?: number };
      if (isSessionExpiredError(err)) return;
      if (apiError.status === 403) {
        toast.error(t.forbidden);
      } else {
        toast.error(t.error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={t.edit}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-card__header">
          <h2 className="modal-card__title">{t.edit}</h2>
          <button
            type="button"
            className="modal-card__close"
            onClick={onClose}
            aria-label={t.cancel}
          >
            <X size={18} />
          </button>
        </div>

        <form className="modal-card__form" onSubmit={handleSubmit} noValidate>
          <div className="modal-field">
            <label className="modal-label" htmlFor="edit-resource-name">
              {t.nameLabel}
            </label>
            <input
              ref={nameRef}
              id="edit-resource-name"
              className={`modal-input${nameError ? " modal-input--error" : ""}`}
              type="text"
              value={form.name}
              placeholder={t.namePlaceholder}
              onChange={(e) => {
                setForm((s) => ({ ...s, name: e.target.value }));
                if (nameError) setNameError(null);
              }}
              disabled={isSaving}
            />
            {nameError && <span className="modal-error">{nameError}</span>}
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="edit-resource-desc">
              {t.descriptionLabel}
            </label>
            <textarea
              id="edit-resource-desc"
              className="edit-resource-textarea"
              value={form.description}
              placeholder={t.descriptionPlaceholder}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
              disabled={isSaving}
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">{t.tagsLabel}</label>
            <div className="tag-chips-editor">
              {form.tags.map((id) => {
                const tag = mergedTags.find((t) => t.id === id);
                if (!tag) return null;
                return (
                  <span key={id} className="tag-chip">
                    {tag.name}
                    <button
                      type="button"
                      className="tag-chip__remove"
                      onClick={() => removeTag(id)}
                      aria-label={t.removeTagAriaLabel(tag.name)}
                      disabled={isSaving}
                    >
                      <X size={10} aria-hidden="true" />
                    </button>
                  </span>
                );
              })}

              {!tagsLoading && (
                <div className="tag-add-wrap" ref={addTagRef}>
                  <button
                    type="button"
                    className="tag-add-btn"
                    onClick={() => {
                      setAddTagOpen((o) => !o);
                      setNewTag("");
                    }}
                    disabled={isSaving}
                    aria-label={t.addTagAriaLabel}
                  >
                    <Plus size={12} aria-hidden="true" />
                    {t.addTagButton}
                  </button>

                  {addTagOpen && (
                    <div className="tag-add-popover">
                      <input
                        autoFocus
                        type="text"
                        className="tag-add-popover__search"
                        placeholder={t.tagsPlaceholder}
                        value={tagSearch}
                        onChange={(e) => {
                          setTagSearch(e.target.value);
                          setNewTag(e.target.value);
                        }}
                      />
                      <ul className="tag-add-popover__list">
                        {filteredAvailable.length === 0 ? (
                          <li className="tag-add-popover__empty">
                            {t.noTagsFound}
                          </li>
                        ) : (
                          filteredAvailable.map((tag) => (
                            <li key={tag.id}>
                              <button
                                type="button"
                                className="tag-add-popover__item"
                                onClick={() => addTag(tag.id)}
                              >
                                {tag.name}
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                      {tagSearch.trim() && (
                        <div className="tag-add-popover__create">
                          <input
                            type="text"
                            className="tag-add-popover__create-input"
                            placeholder={t.newTagPlaceholder}
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleCreateTag();
                              }
                            }}
                            disabled={creating}
                          />
                          <button
                            type="button"
                            className="tag-add-popover__create-btn"
                            onClick={handleCreateTag}
                            disabled={!newTag.trim() || creating}
                          >
                            {creating ? t.saving : t.createTagButton}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="modal-card__actions">
            <button
              type="button"
              className="edit-resource-btn edit-resource-btn--secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="edit-resource-btn edit-resource-btn--primary"
              disabled={isSaving}
            >
              {isSaving ? t.saving : t.saveButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
