import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, GitBranch } from "lucide-react";
import { X } from "lucide-react";
import { useRepositoryScan } from "../../../shared/hooks/useRepositoryScan";
import type { RepositoryScanResponse } from "../../../shared/lib/resources/repositoryApi";
import type { ResourceType } from "../../../shared/lib/resources/resourcesApi";
import { uploadResource } from "../../../shared/lib/resources/resourcesApi";
import { createTag, type Tag } from "../../../shared/lib/resources/tagsApi";
import { useTags } from "../../../shared/hooks/useTags";
import { toast } from "../../../shared/lib/toast/toastBus";
import type { ApiError } from "../../../shared/lib/apiClient";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import { Step0SourceSelect, type SourceType } from "./Step0SourceSelect";
import { Step2ModeSelect, type AddMode } from "./Step2ModeSelect";
import { Step3Review } from "./Step3Review";
import { StepUploadForm, type UploadFormData } from "./StepUploadForm";
import type { ResourceDraft } from "./ResourceReviewCard";
import "./AddResourceModal.css";

interface AddResourceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  t: Translations["catalog"]["addResource"];
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getCommonPath(paths: string[]): string {
  if (!paths.length) return "";
  if (paths.length === 1) return paths[0];
  const parts = paths.map((p) => p.split("/"));
  const min = Math.min(...parts.map((p) => p.length));
  let i = 0;
  while (i < min && parts.every((p) => p[i] === parts[0][i])) i++;
  return parts[0].slice(0, i).join("/");
}

function repoNameFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    const parts = pathname
      .replace(/\.git$/, "")
      .split("/")
      .filter(Boolean);
    return parts[parts.length - 1] ?? url;
  } catch {
    return url;
  }
}

function buildDrafts(
  mode: AddMode,
  scan: RepositoryScanResponse,
  originalUrl: string,
): ResourceDraft[] {
  const gitUrl = originalUrl;
  const repoName = repoNameFromUrl(originalUrl);

  const allItems = [
    ...scan.agents.map((r) => ({ ...r, type: "AGENT" as ResourceType })),
    ...scan.skills.map((r) => ({ ...r, type: "SKILL" as ResourceType })),
    ...scan.instructions.map((r) => ({
      ...r,
      type: "INSTRUCTION" as ResourceType,
    })),
  ];

  if (mode === "individual") {
    return allItems.map((item, idx) => ({
      id: String(idx),
      name: item.name ?? "",
      description: item.description ?? "",
      type: item.type,
      gitUrl: item.gitUrl ?? gitUrl,
      path: item.path ?? "",
      tags: [],
      selected: true,
    }));
  }

  const typeMap: Record<Exclude<AddMode, "individual">, ResourceType> = {
    agent: "AGENT",
    kit: "KIT",
    mcp: "MCP",
  };

  const commonPath = getCommonPath(
    allItems.map((i) => i.path ?? "").filter(Boolean),
  );

  return [
    {
      id: "0",
      name: repoName,
      description: "",
      type: typeMap[mode as Exclude<AddMode, "individual">],
      gitUrl,
      path: commonPath,
      tags: [],
      selected: true,
    },
  ];
}

export function AddResourceModal({
  onClose,
  onSuccess,
  t,
}: AddResourceModalProps) {
  const [sourceType, setSourceType] = useState<SourceType | null>(null);

  // --- Git flow state ---
  const [gitStep, setGitStep] = useState<1 | 2 | 3>(1);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<RepositoryScanResponse | null>(
    null,
  );
  const [selectedMode, setSelectedMode] = useState<AddMode | null>(null);
  const [drafts, setDrafts] = useState<ResourceDraft[]>([]);

  // --- Upload flow state ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localTags, setLocalTags] = useState<Tag[]>([]);

  const urlInputRef = useRef<HTMLInputElement>(null);
  const {
    scan,
    isLoading: isScanning,
    error: scanError,
    clearError,
  } = useRepositoryScan();
  const { tags: fetchedTags } = useTags();

  const availableTags = [
    ...fetchedTags,
    ...localTags.filter((lt) => !fetchedTags.some((ft) => ft.id === lt.id)),
  ];

  // Focus URL input when entering git step 1
  useEffect(() => {
    if (sourceType === "git" && gitStep === 1) {
      urlInputRef.current?.focus();
    }
  }, [sourceType, gitStep]);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // ──── Source selection ────
  function handleSourceSelect(type: SourceType) {
    setSourceType(type);
    if (type === "git") {
      setGitStep(1);
    }
  }

  // ──── Git URL validation & scan ────
  function validateUrl(): boolean {
    if (!url.trim()) {
      setUrlError(t.step1.urlRequired);
      return false;
    }
    if (!isValidUrl(url.trim())) {
      setUrlError(t.step1.urlInvalid);
      return false;
    }
    setUrlError(null);
    return true;
  }

  async function handleGitUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!validateUrl()) return;

    const result = await scan(url.trim());
    if (result !== null) {
      setScanResult(result);
      setGitStep(2);
    }
  }

  function handleModeSelect(mode: AddMode) {
    setSelectedMode(mode);
    const built = buildDrafts(mode, scanResult!, url.trim());
    setDrafts(built);
    setGitStep(3);
  }

  // ──── Upload flow ────
  async function handleCreateTag(name: string): Promise<Tag | null> {
    try {
      const created = await createTag({ name });
      setLocalTags((prev) => [...prev, created]);
      return created;
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        toast.error(`Tag "${name}" already exists.`);
      } else {
        toast.error(`Could not create tag "${name}".`);
      }
      return null;
    }
  }

  async function handleUploadSubmit(data: UploadFormData) {
    setIsUploading(true);
    setUploadError(null);
    try {
      await uploadResource({
        name: data.name,
        type: data.type,
        description: data.description,
        tags: data.tags.length > 0 ? data.tags : undefined,
        files: data.files,
      });
      toast.success(t.stepUpload.successMessage);
      onSuccess?.() ?? onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      setUploadError(apiErr.message ?? t.stepUpload.errorMessage);
    } finally {
      setIsUploading(false);
    }
  }

  function handleUploadCancel() {
    setSourceType(null);
  }

  // ──── Step badge & title ────
  function getStepLabel(): string {
    if (!sourceType) return t.step(1, 3);
    if (sourceType === "git") {
      return t.step(gitStep + 1, 4);
    }
    // upload: step 2 of 3 (source selection was step 1)
    return t.step(2, 3);
  }

  function getStepTitle(): string {
    if (!sourceType) return t.step0.modalTitle;
    if (sourceType === "upload") return t.stepUpload.modalTitle;
    return t.modalTitle;
  }

  // ──── Render ────
  const isGitReviewStep = sourceType === "git" && gitStep === 3;

  return (
    <div
      className="add-resource-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-resource-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`add-resource-card${isGitReviewStep ? " add-resource-card--wide" : ""}`}
      >
        {/* Header */}
        <div className="add-resource-card__header">
          <div className="add-resource-card__title-group">
            <span className="add-resource-card__step-badge">
              {getStepLabel()}
            </span>
            <h2 id="add-resource-title" className="add-resource-card__title">
              {getStepTitle()}
            </h2>
          </div>
          <button
            type="button"
            className="add-resource-card__close"
            onClick={onClose}
            aria-label={t.step1.cancelButton}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* ── Step 0: Source selection ── */}
        {!sourceType && (
          <div className="add-resource-card__form">
            <Step0SourceSelect t={t.step0} onSelect={handleSourceSelect} />
            <div className="add-resource-card__actions">
              <button
                type="button"
                className="add-resource-btn add-resource-btn--secondary"
                onClick={onClose}
              >
                {t.step1.cancelButton}
              </button>
            </div>
          </div>
        )}

        {/* ── Git: Step 1 (URL) ── */}
        {sourceType === "git" && gitStep === 1 && (
          <form
            className="add-resource-card__form"
            onSubmit={handleGitUrlSubmit}
            noValidate
          >
            <div className="add-resource-step1">
              <div className="add-resource-step1__intro">
                <GitBranch
                  size={16}
                  className="add-resource-step1__icon"
                  aria-hidden="true"
                />
                <p className="add-resource-step1__description">
                  {t.step1.description}
                </p>
              </div>

              <div className="add-resource-field">
                <label
                  className="add-resource-label"
                  htmlFor="add-resource-url"
                >
                  {t.step1.urlLabel}
                </label>
                <input
                  ref={urlInputRef}
                  id="add-resource-url"
                  type="url"
                  className={`add-resource-input${urlError ? " add-resource-input--error" : ""}`}
                  value={url}
                  placeholder={t.step1.urlPlaceholder}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) setUrlError(null);
                    if (scanError) clearError();
                  }}
                  disabled={isScanning}
                  aria-describedby={
                    urlError
                      ? "add-resource-url-error"
                      : scanError
                        ? "add-resource-scan-error"
                        : undefined
                  }
                  aria-invalid={!!(urlError || scanError)}
                  autoComplete="url"
                />
                {urlError && (
                  <p
                    id="add-resource-url-error"
                    className="add-resource-error"
                    role="alert"
                  >
                    {urlError}
                  </p>
                )}
              </div>

              {scanError && (
                <div
                  id="add-resource-scan-error"
                  className="add-resource-scan-error"
                  role="alert"
                >
                  <AlertTriangle size={14} aria-hidden="true" />
                  <span>{t.step1.errorMessage}</span>
                </div>
              )}
            </div>

            <div className="add-resource-card__actions">
              <button
                type="button"
                className="add-resource-btn add-resource-btn--secondary"
                onClick={() => setSourceType(null)}
                disabled={isScanning}
              >
                {t.step3.backButton}
              </button>
              <button
                type="submit"
                className="add-resource-btn add-resource-btn--primary"
                disabled={isScanning}
                aria-busy={isScanning}
              >
                {isScanning ? (
                  <span className="add-resource-spinner" aria-hidden="true" />
                ) : (
                  <ArrowRight size={14} aria-hidden="true" />
                )}
                {isScanning ? t.step1.scanning : t.step1.scanButton}
              </button>
            </div>
          </form>
        )}

        {/* ── Git: Step 2 (Mode select) ── */}
        {sourceType === "git" && gitStep === 2 && scanResult && (
          <div className="add-resource-card__form">
            <Step2ModeSelect
              scanResult={scanResult}
              t={t.step2}
              onSelect={handleModeSelect}
            />
            <div className="add-resource-card__actions">
              <button
                type="button"
                className="add-resource-btn add-resource-btn--secondary"
                onClick={() => setGitStep(1)}
              >
                {t.step3.backButton}
              </button>
            </div>
          </div>
        )}

        {/* ── Git: Step 3 (Review) ── */}
        {sourceType === "git" && gitStep === 3 && selectedMode && (
          <Step3Review
            drafts={drafts}
            isIndividualMode={selectedMode === "individual"}
            t={t.step3}
            onBack={() => setGitStep(2)}
            onDone={onSuccess ?? onClose}
          />
        )}

        {/* ── Upload: Form ── */}
        {sourceType === "upload" && (
          <div className="add-resource-card__form">
            {uploadError && (
              <div className="add-resource-scan-error" role="alert">
                <AlertTriangle size={14} aria-hidden="true" />
                <span>{uploadError}</span>
              </div>
            )}
            <StepUploadForm
              t={t.stepUpload}
              tStep3={t.step3}
              availableTags={availableTags}
              onCreateTag={handleCreateTag}
              onSubmit={handleUploadSubmit}
              onCancel={handleUploadCancel}
              isSubmitting={isUploading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
