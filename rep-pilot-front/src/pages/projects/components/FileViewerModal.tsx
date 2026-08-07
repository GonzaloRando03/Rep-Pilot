import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, X } from "lucide-react";
import { fetchFileContent } from "../../../shared/lib/projects/projectsApi";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import "./FileViewerModal.css";

interface FileViewerModalProps {
  projectId: string;
  filePath: string;
  fileName: string;
  category: string;
  onClose: () => void;
  t: Translations["projects"]["detail"]["fileViewer"];
}

function isMarkdown(name: string): boolean {
  return name.endsWith(".md");
}

function isCodeFile(name: string): boolean {
  const codeExts = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
    ".rb",
    ".go",
    ".rs",
    ".java",
    ".kt",
    ".swift",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".css",
    ".scss",
    ".less",
    ".html",
    ".xml",
    ".json",
    ".yml",
    ".yaml",
    ".toml",
    ".sh",
    ".bash",
    ".ps1",
    ".sql",
    ".graphql",
    ".proto",
  ];
  const lower = name.toLowerCase();
  return codeExts.some((ext) => lower.endsWith(ext));
}

function getLanguage(name: string): string {
  const map: Record<string, string> = {
    ".ts": "typescript",
    ".tsx": "tsx",
    ".js": "javascript",
    ".jsx": "jsx",
    ".py": "python",
    ".rb": "ruby",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".kt": "kotlin",
    ".swift": "swift",
    ".c": "c",
    ".cpp": "cpp",
    ".h": "c",
    ".hpp": "cpp",
    ".css": "css",
    ".scss": "scss",
    ".less": "less",
    ".html": "html",
    ".xml": "xml",
    ".json": "json",
    ".yml": "yaml",
    ".yaml": "yaml",
    ".toml": "toml",
    ".sh": "bash",
    ".bash": "bash",
    ".ps1": "powershell",
    ".sql": "sql",
    ".graphql": "graphql",
    ".proto": "protobuf",
  };
  const ext = name.slice(name.lastIndexOf("."));
  return map[ext] ?? "";
}

export function FileViewerModal({
  projectId,
  filePath,
  fileName,
  category,
  onClose,
  t,
}: FileViewerModalProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchFileContent(projectId, filePath)
      .then((res) => setContent(res.content))
      .catch(() => setError(t.loadError))
      .finally(() => setIsLoading(false));
  }, [projectId, filePath, t.loadError]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const md = isMarkdown(fileName);
  const code = isCodeFile(fileName);
  const lang = getLanguage(fileName);

  return (
    <div className="fv-backdrop" onClick={onClose}>
      <div
        className="fv-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fv-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="fv-card__header">
          <div className="fv-card__title-group">
            <span className="fv-card__category">{category}</span>
            <h2 id="fv-title" className="fv-card__title">
              {fileName}
            </h2>
            <code className="fv-card__path">{filePath}</code>
          </div>
          <button
            type="button"
            className="fv-card__close"
            onClick={onClose}
            aria-label={t.closeAriaLabel}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="fv-card__body">
          {isLoading ? (
            <div className="fv-loading" aria-busy="true">
              <Loader2
                size={24}
                aria-hidden="true"
                className="fv-loading__icon"
              />
              <span>{t.loading}</span>
            </div>
          ) : error ? (
            <div className="fv-error" role="alert">
              {error}
            </div>
          ) : content !== null ? (
            md ? (
              <div className="fv-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : code ? (
              <pre className="fv-code">
                <code className={lang ? `language-${lang}` : undefined}>
                  {content}
                </code>
              </pre>
            ) : (
              <pre className="fv-code">
                <code>{content}</code>
              </pre>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
