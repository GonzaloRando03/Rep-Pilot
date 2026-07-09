import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, GitBranch } from "lucide-react";
import { X } from "lucide-react";
import { useRepositoryScan } from "../../../shared/hooks/useRepositoryScan";
import type { RepositoryScanResponse } from "../../../shared/lib/resources/repositoryApi";
import type { ResourceType } from "../../../shared/lib/resources/resourcesApi";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import { Step2ModeSelect, type AddMode } from "./Step2ModeSelect";
import { Step3Review } from "./Step3Review";
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
    const parts = pathname.replace(/\.git$/, "").split("/").filter(Boolean);
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

  const commonPath = getCommonPath(allItems.map((i) => i.path ?? "").filter(Boolean));

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

export function AddResourceModal({ onClose, onSuccess, t }: AddResourceModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<RepositoryScanResponse | null>(
    null,
  );
  const [selectedMode, setSelectedMode] = useState<AddMode | null>(null);
  const [drafts, setDrafts] = useState<ResourceDraft[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { scan, isLoading, error: scanError, clearError } = useRepositoryScan();

  useEffect(() => {
    if (step === 1) inputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function validate(): boolean {
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

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    const result = await scan(url.trim());
    if (result !== null) {
      setScanResult(result);
      setStep(2);
    }
  }

  function handleModeSelect(mode: AddMode) {
    setSelectedMode(mode);
    const built = buildDrafts(mode, scanResult!, url.trim());
    setDrafts(built);
    setStep(3);
  }

  const stepTitles: Record<1 | 2 | 3, string> = {
    1: t.modalTitle,
    2: t.modalTitle,
    3: t.modalTitle,
  };

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
      <div className={`add-resource-card${step === 3 ? " add-resource-card--wide" : ""}`}>
        {/* Header */}
        <div className="add-resource-card__header">
          <div className="add-resource-card__title-group">
            <span className="add-resource-card__step-badge">
              {t.step(step, 3)}
            </span>
            <h2 id="add-resource-title" className="add-resource-card__title">
              {stepTitles[step]}
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

        {/* Step 1 */}
        {step === 1 && (
          <form
            className="add-resource-card__form"
            onSubmit={handleStep1Submit}
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
                  ref={inputRef}
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
                  disabled={isLoading}
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
                onClick={onClose}
                disabled={isLoading}
              >
                {t.step1.cancelButton}
              </button>
              <button
                type="submit"
                className="add-resource-btn add-resource-btn--primary"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <span className="add-resource-spinner" aria-hidden="true" />
                ) : (
                  <ArrowRight size={14} aria-hidden="true" />
                )}
                {isLoading ? t.step1.scanning : t.step1.scanButton}
              </button>
            </div>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && scanResult && (
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
                onClick={() => setStep(1)}
              >
                {t.step3.backButton}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && selectedMode && (
          <Step3Review
            drafts={drafts}
            isIndividualMode={selectedMode === "individual"}
            t={t.step3}
            onBack={() => setStep(2)}
            onDone={onSuccess ?? onClose}
          />
        )}
      </div>
    </div>
  );
}
