import { useEffect, useRef, useState } from "react";
import { ChevronDown, Pencil, Plus, X } from "lucide-react";
import type { Tag } from "../../../shared/lib/resources/tagsApi";
import type { ResourceType } from "../../../shared/lib/resources/resourcesApi";
import { getResourceTypeLabel } from "../../../shared/lib/resources/resourcesApi";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import "./ResourceReviewCard.css";

export interface ResourceDraft {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  gitUrl: string;
  path: string;
  tags: string[];
  selected: boolean;
  hasFiles?: boolean;
  files?: File[];
}

interface ResourceReviewCardProps {
  draft: ResourceDraft;
  showCheckbox: boolean;
  availableTags: Tag[];
  hasError: boolean;
  onUpdate: (updated: ResourceDraft) => void;
  onCreateTag: (name: string) => Promise<Tag | null>;
  t: Translations["catalog"]["addResource"]["step3"];
}

export function TagPicker({
  availableTags,
  selected,
  onChange,
  onCreateTag,
  t,
}: {
  availableTags: Tag[];
  selected: string[];
  onChange: (names: string[]) => void;
  onCreateTag: (name: string) => Promise<Tag | null>;
  t: Translations["catalog"]["addResource"]["step3"];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newTag, setNewTag] = useState("");
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = availableTags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function toggleTag(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  }

  async function handleCreate() {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    setCreating(true);
    const created = await onCreateTag(trimmed);
    if (created) {
      onChange([...selected, created.id]);
      setNewTag("");
    }
    setCreating(false);
  }

  return (
    <div className="tag-picker" ref={containerRef}>
      <button
        type="button"
        className="tag-picker__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Plus size={12} aria-hidden="true" />
        {t.tagsLabel}
        <ChevronDown
          size={12}
          aria-hidden="true"
          className={open ? "tag-picker__chevron--open" : ""}
        />
      </button>

      {open && (
        <div className="tag-picker__panel" role="listbox" aria-multiselectable>
          <input
            type="text"
            className="tag-picker__search"
            placeholder={t.tagSearchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <ul className="tag-picker__list">
            {filtered.length === 0 ? (
              <li className="tag-picker__empty">{t.noTagsFound}</li>
            ) : (
              filtered.map((tag) => (
                <li
                  key={tag.id}
                  className="tag-picker__item"
                  role="option"
                  aria-selected={selected.includes(tag.id)}
                >
                  <label className="tag-picker__label">
                    <input
                      type="checkbox"
                      checked={selected.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      className="tag-picker__checkbox"
                    />
                    {tag.name}
                  </label>
                </li>
              ))
            )}
          </ul>
          <div className="tag-picker__create">
            <input
              type="text"
              className="tag-picker__create-input"
              placeholder={t.newTagPlaceholder}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              disabled={creating}
            />
            <button
              type="button"
              className="tag-picker__create-btn"
              onClick={handleCreate}
              disabled={!newTag.trim() || creating}
            >
              {t.addTagButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ResourceReviewCard({
  draft,
  showCheckbox,
  availableTags,
  hasError,
  onUpdate,
  onCreateTag,
  t,
}: ResourceReviewCardProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(draft.name);
  const [editDescription, setEditDescription] = useState(draft.description);
  const [nameError, setNameError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);

  function handleEdit() {
    setEditName(draft.name);
    setEditDescription(draft.description);
    setNameError(null);
    setDescError(null);
    setEditing(true);
  }

  function handleSave() {
    let valid = true;
    if (!editName.trim()) {
      setNameError(t.nameRequired);
      valid = false;
    } else {
      setNameError(null);
    }
    if (!editDescription.trim()) {
      setDescError(t.descriptionRequired);
      valid = false;
    } else {
      setDescError(null);
    }
    if (!valid) return;
    onUpdate({
      ...draft,
      name: editName.trim(),
      description: editDescription.trim(),
    });
    setEditing(false);
  }

  function handleCancelEdit() {
    setEditing(false);
    setNameError(null);
    setDescError(null);
  }

  const isEmpty =
    !draft.name.trim() || !draft.description.trim() || draft.tags.length === 0;
  // Solo aplicar validación visual a las cards seleccionadas (en modo individual el checkbox lo controla)
  const effectiveError = hasError && (!showCheckbox || draft.selected);
  const cardClass = [
    "review-card",
    effectiveError && isEmpty ? "review-card--error" : "",
    !draft.selected ? "review-card--dimmed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClass}>
      <div className="review-card__header">
        {showCheckbox && (
          <label className="review-card__checkbox-label">
            <input
              type="checkbox"
              checked={draft.selected}
              onChange={() => onUpdate({ ...draft, selected: !draft.selected })}
              className="review-card__checkbox"
            />
            <span className="sr-only">{t.includeLabel}</span>
          </label>
        )}
        <span
          className={`resource-type-badge resource-type-badge--${draft.type}`}
        >
          {getResourceTypeLabel(draft.type)}
        </span>
        {!editing && (
          <button
            type="button"
            className="review-card__edit-btn"
            onClick={handleEdit}
            aria-label={t.editButton}
          >
            <Pencil size={13} aria-hidden="true" />
            {t.editButton}
          </button>
        )}
      </div>

      {editing ? (
        <div className="review-card__edit-form">
          <div className="review-card__field">
            <label className="review-card__field-label">{t.nameLabel}</label>
            <input
              type="text"
              className={`review-card__input${nameError ? " review-card__input--error" : ""}`}
              value={editName}
              placeholder={t.namePlaceholder}
              onChange={(e) => {
                setEditName(e.target.value);
                if (nameError) setNameError(null);
              }}
              autoFocus
            />
            {nameError && (
              <p className="review-card__field-error" role="alert">
                {nameError}
              </p>
            )}
          </div>
          <div className="review-card__field">
            <label className="review-card__field-label">
              {t.descriptionLabel}
            </label>
            <textarea
              className={`review-card__textarea${descError ? " review-card__input--error" : ""}`}
              value={editDescription}
              placeholder={t.descriptionPlaceholder}
              rows={3}
              onChange={(e) => {
                setEditDescription(e.target.value);
                if (descError) setDescError(null);
              }}
            />
            {descError && (
              <p className="review-card__field-error" role="alert">
                {descError}
              </p>
            )}
          </div>
          <div className="review-card__edit-actions">
            <button
              type="button"
              className="review-card__btn review-card__btn--ghost"
              onClick={handleCancelEdit}
            >
              {t.cancelEditButton}
            </button>
            <button
              type="button"
              className="review-card__btn review-card__btn--primary"
              onClick={handleSave}
            >
              {t.saveButton}
            </button>
          </div>
        </div>
      ) : (
        <div className="review-card__view">
          <p className="review-card__name">
            {draft.name || (
              <em className="review-card__empty-hint">{t.namePlaceholder}</em>
            )}
          </p>
          <p className="review-card__description">
            {draft.description || (
              <em className="review-card__empty-hint">
                {t.descriptionPlaceholder}
              </em>
            )}
          </p>
        </div>
      )}

      <div
        className={`review-card__tags${effectiveError && draft.tags.length === 0 ? " review-card__tags--error" : ""}`}
      >
        {draft.tags.map((tagId) => {
          const tagName =
            availableTags.find((t) => t.id === tagId)?.name ?? tagId;
          return (
            <span key={tagId} className="review-card__tag">
              {tagName}
              {editing && (
                <button
                  type="button"
                  className="review-card__tag-remove"
                  onClick={() =>
                    onUpdate({
                      ...draft,
                      tags: draft.tags.filter((t) => t !== tagId),
                    })
                  }
                  aria-label={`Remove ${tagName}`}
                >
                  <X size={10} aria-hidden="true" />
                </button>
              )}
            </span>
          );
        })}
        {editing && (
          <TagPicker
            availableTags={availableTags}
            selected={draft.tags}
            onChange={(names) => onUpdate({ ...draft, tags: names })}
            onCreateTag={onCreateTag}
            t={t}
          />
        )}
        {effectiveError && draft.tags.length === 0 && (
          <p className="review-card__field-error" role="alert">
            {t.tagsRequired}
          </p>
        )}
      </div>
    </article>
  );
}
