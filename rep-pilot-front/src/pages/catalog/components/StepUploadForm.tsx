import { useEffect, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import type { ResourceType } from "../../../shared/lib/resources/resourcesApi";
import { getResourceTypeLabel } from "../../../shared/lib/resources/resourcesApi";
import type { Tag } from "../../../shared/lib/resources/tagsApi";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import { TagPicker } from "./ResourceReviewCard";
import "./StepUploadForm.css";

export interface UploadFormData {
  name: string;
  type: ResourceType;
  description: string;
  tags: string[];
  files: File[];
}

interface StepUploadFormProps {
  t: Translations["catalog"]["addResource"]["stepUpload"];
  tStep3: Translations["catalog"]["addResource"]["step3"];
  availableTags: Tag[];
  onCreateTag: (name: string) => Promise<Tag | null>;
  onSubmit: (data: UploadFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const RESOURCE_TYPES: ResourceType[] = [
  "SKILL",
  "INSTRUCTION",
  "AGENT",
  "MCP",
  "KIT",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StepUploadForm({
  t,
  tStep3,
  availableTags,
  onCreateTag,
  onSubmit,
  onCancel,
  isSubmitting,
}: StepUploadFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ResourceType>("SKILL");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t.nameRequired;
    if (!description.trim()) errs.description = t.descriptionRequired;
    if (files.length === 0) errs.files = t.filesRequired;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      type,
      description: description.trim(),
      tags,
      files,
    });
  }

  function handleFilesAdded(newFiles: FileList | null) {
    if (!newFiles) return;
    const incoming = Array.from(newFiles);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const unique = incoming.filter((f) => !existingNames.has(f.name));
      return [...prev, ...unique];
    });
    if (errors.files) setErrors((prev) => ({ ...prev, files: "" }));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFilesAdded(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit} noValidate>
      {/* Name */}
      <div className="add-resource-field">
        <label className="add-resource-label" htmlFor="upload-name">
          {tStep3.nameLabel}
        </label>
        <input
          ref={nameRef}
          id="upload-name"
          type="text"
          className={`add-resource-input${errors.name ? " add-resource-input--error" : ""}`}
          value={name}
          placeholder={tStep3.namePlaceholder}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "upload-name-error" : undefined}
        />
        {errors.name && (
          <p id="upload-name-error" className="add-resource-error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Type */}
      <div className="add-resource-field">
        <label className="add-resource-label" htmlFor="upload-type">
          {t.typeLabel}
        </label>
        <select
          id="upload-type"
          className="add-resource-input"
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          disabled={isSubmitting}
        >
          {RESOURCE_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {getResourceTypeLabel(rt)}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="add-resource-field">
        <label className="add-resource-label" htmlFor="upload-description">
          {tStep3.descriptionLabel}
        </label>
        <textarea
          id="upload-description"
          className={`add-resource-input upload-form__textarea${errors.description ? " add-resource-input--error" : ""}`}
          value={description}
          placeholder={tStep3.descriptionPlaceholder}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description)
              setErrors((prev) => ({ ...prev, description: "" }));
          }}
          disabled={isSubmitting}
          rows={3}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? "upload-desc-error" : undefined
          }
        />
        {errors.description && (
          <p id="upload-desc-error" className="add-resource-error" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="add-resource-field">
        <span className="add-resource-label">{tStep3.tagsLabel}</span>
        {/* Inline tag management */}
        <div className="upload-form__tags">
          {tags.length > 0 && (
            <div className="upload-form__tag-list">
              {tags.map((tagId) => {
                const tag = availableTags.find((t) => t.id === tagId);
                return (
                  <span key={tagId} className="upload-form__tag-chip">
                    {tag?.name ?? tagId}
                    <button
                      type="button"
                      className="upload-form__tag-remove"
                      onClick={() =>
                        setTags((prev) => prev.filter((t) => t !== tagId))
                      }
                      aria-label={`${tStep3.removeTagAriaLabel ?? "Remove"} ${tag?.name ?? tagId}`}
                      disabled={isSubmitting}
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <TagPicker
            availableTags={availableTags.filter(
              (tag) => !tags.includes(tag.id),
            )}
            selected={tags}
            onChange={setTags}
            onCreateTag={onCreateTag}
            t={tStep3}
          />
        </div>
      </div>

      {/* File drop zone */}
      <div className="add-resource-field">
        <span className="add-resource-label">{t.filesLabel}</span>
        <div
          className={`upload-form__drop-zone${errors.files ? " upload-form__drop-zone--error" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={t.dropzoneAriaLabel}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <Upload
            size={20}
            aria-hidden="true"
            className="upload-form__drop-icon"
          />
          <p className="upload-form__drop-text">{t.dropzoneText}</p>
          <p className="upload-form__drop-hint">{t.dropzoneHint}</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="upload-form__file-input"
            onChange={(e) => handleFilesAdded(e.target.files)}
            disabled={isSubmitting}
            aria-hidden="true"
          />
        </div>
        {errors.files && (
          <p
            id="upload-files-error"
            className="add-resource-error"
            role="alert"
          >
            {errors.files}
          </p>
        )}

        {/* File list */}
        {files.length > 0 && (
          <ul className="upload-form__file-list">
            {files.map((file, idx) => (
              <li
                key={`${file.name}-${idx}`}
                className="upload-form__file-item"
              >
                <FileText
                  size={14}
                  aria-hidden="true"
                  className="upload-form__file-icon"
                />
                <span className="upload-form__file-name">{file.name}</span>
                <span className="upload-form__file-size">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  className="upload-form__file-remove"
                  onClick={() => removeFile(idx)}
                  disabled={isSubmitting}
                  aria-label={`${t.removeFileAriaLabel} ${file.name}`}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="add-resource-card__actions">
        <button
          type="button"
          className="add-resource-btn add-resource-btn--secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t.cancelButton}
        </button>
        <button
          type="submit"
          className="add-resource-btn add-resource-btn--primary"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting && (
            <span className="add-resource-spinner" aria-hidden="true" />
          )}
          {isSubmitting ? t.submitting : t.submitButton}
        </button>
      </div>
    </form>
  );
}
