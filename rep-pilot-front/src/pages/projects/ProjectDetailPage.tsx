import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  File,
  FileText,
  Folder,
  FolderOpen,
  Loader2,
  Pencil,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useProjectDetail } from "../../shared/hooks/useProjectDetail";
import { useTranslation } from "../../shared/hooks/useTranslation";
import { userStorage } from "../../shared/lib/auth/userStorage";
import { FileViewerModal } from "./components/FileViewerModal";
import { EditProjectModal } from "./components/EditProjectModal";
import "./ProjectDetailPage.css";

/* ── Tree utilities ── */
interface TreeNode {
  [key: string]: TreeNode | boolean;
}

function compactLeadingDuplicateDirectory(tree: TreeNode): TreeNode {
  const rootEntries = Object.entries(tree);
  if (rootEntries.length !== 1) return tree;

  const [rootName, rootValue] = rootEntries[0];
  if (typeof rootValue !== "object" || rootValue === null) return tree;

  const childEntries = Object.entries(rootValue);
  if (childEntries.length !== 1 || childEntries[0][0] !== rootName) return tree;

  const [, childValue] = childEntries[0];
  return typeof childValue === "object" && childValue !== null
    ? rootValue
    : tree;
}

function flattenTree(
  tree: TreeNode,
  prefix = "",
): { name: string; path: string }[] {
  const result: { name: string; path: string }[] = [];
  for (const [key, value] of Object.entries(tree)) {
    const fullPath = prefix ? `${prefix}/${key}` : key;
    if (value === true) {
      result.push({ name: key, path: fullPath });
    } else if (typeof value === "object" && value !== null) {
      result.push(...flattenTree(value as TreeNode, fullPath));
    }
  }
  return result;
}

function getFileCategory(name: string): string {
  if (name === "AGENTS.md" || name.endsWith(".agent.md")) return "agent";
  if (name === "SKILL.md" || name.endsWith(".skill.md")) return "skill";
  if (name.endsWith(".instructions.md")) return "instruction";
  if (name.endsWith(".prompt.md")) return "prompt";
  return "file";
}

const CATEGORY_LABELS: Record<string, string> = {
  agent: "Agent",
  skill: "Skill",
  instruction: "Instruction",
  prompt: "Prompt",
  file: "File",
};

const FILE_TYPES = ["agent", "skill", "instruction", "prompt", "file"] as const;
const ITEMS_PER_PAGE = 8;

function DirectoryTree({
  tree,
  depth = 0,
}: {
  tree: TreeNode;
  depth?: number;
}) {
  const entries = Object.entries(tree);
  if (entries.length === 0) return null;

  return (
    <ul
      className="pdt-tree"
      style={{ paddingLeft: depth === 0 ? 0 : undefined }}
    >
      {entries.map(([name, value]) => {
        const isFile = value === true;
        const isDir = typeof value === "object" && value !== null;

        return (
          <li key={name} className="pdt-tree__item">
            {isFile ? (
              <span className="pdt-tree__file">
                <File size={14} aria-hidden="true" />
                {name}
              </span>
            ) : isDir ? (
              <details className="pdt-tree__dir" open={depth < 1}>
                <summary className="pdt-tree__summary">
                  <ChevronRight
                    size={12}
                    aria-hidden="true"
                    className="pdt-tree__chevron"
                  />
                  <Folder size={14} aria-hidden="true" />
                  {name}
                </summary>
                <DirectoryTree tree={value as TreeNode} depth={depth + 1} />
              </details>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const tp = t.projects;
  const td = tp.detail;
  const { project, isLoading, error, update, remove, isUpdating, isDeleting } =
    useProjectDetail(id ?? "");

  const [fileTypeFilter, setFileTypeFilter] = useState<string>("");
  const [filePage, setFilePage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<{
    path: string;
    name: string;
    category: string;
  } | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentUser = userStorage.get();
  const canManage =
    !!currentUser &&
    (currentUser.isAdmin || project?.createdBy?.id === currentUser.id);

  const allFiles = useMemo(
    () => (project ? flattenTree(project.directoryTree as TreeNode) : []),
    [project],
  );

  const filteredFiles = useMemo(() => {
    if (!fileTypeFilter) return allFiles;
    return allFiles.filter((f) => getFileCategory(f.name) === fileTypeFilter);
  }, [allFiles, fileTypeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFiles.length / ITEMS_PER_PAGE),
  );
  const paginatedFiles = useMemo(
    () =>
      filteredFiles.slice(
        (filePage - 1) * ITEMS_PER_PAGE,
        filePage * ITEMS_PER_PAGE,
      ),
    [filteredFiles, filePage],
  );

  function handleTypeChange(type: string) {
    setFileTypeFilter(type);
    setFilePage(1);
  }

  function handleDownloadConf() {
    if (!project) return;

    const conf = {
      projectId: project.id,
      syncInterval: 300,
      syncFolders: [project.rootFolderName],
    };

    const blob = new Blob([JSON.stringify(conf, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reppilot-conf.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleDeleteConfirm() {
    const success = await remove();
    if (success) navigate("/projects");
  }

  if (isLoading) {
    return (
      <div className="pdt-page">
        <div className="pdt-loading" aria-busy="true">
          <Loader2 size={32} aria-hidden="true" className="pdt-loading__icon" />
          <p>{td.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="pdt-page">
        <div className="pdt-error" role="alert">
          <AlertTriangle size={24} aria-hidden="true" />
          <div>
            <p className="pdt-error__title">{td.notFound}</p>
            <p className="pdt-error__desc">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(project.createdAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="pdt-page">
      {/* Back */}
      <button
        type="button"
        className="pdt-back"
        onClick={() => navigate("/projects")}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {td.backButton}
      </button>

      {/* Header */}
      <header className="pdt-header">
        <div className="pdt-header__top">
          <h1 className="pdt-header__title">{project.name}</h1>
          <span className="pdt-header__root-badge">
            <Folder size={13} aria-hidden="true" />
            {project.rootFolderName}
          </span>
          <button
            type="button"
            className="pdt-header__download-btn"
            title={td.downloadConfTooltip}
            onClick={handleDownloadConf}
          >
            <Download size={14} aria-hidden="true" />
            {td.downloadConf}
          </button>
        </div>

        <div className="pdt-header__meta">
          <span className="pdt-header__meta-item">
            <User size={14} aria-hidden="true" />
            {td.createdBy} {project.createdBy.name}
          </span>
          <span className="pdt-header__meta-item">
            <CalendarDays size={14} aria-hidden="true" />
            {formattedDate}
          </span>
          {canManage && (
            <div className="pdt-header__actions">
              <button
                type="button"
                className="pdt-header__action-btn pdt-header__action-btn--edit"
                onClick={() => setShowEditModal(true)}
                aria-label={td.editButton}
              >
                <Pencil size={14} aria-hidden="true" />
                {td.editButton}
              </button>
              <button
                type="button"
                className="pdt-header__action-btn pdt-header__action-btn--delete"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label={td.deleteButton}
              >
                <Trash2 size={14} aria-hidden="true" />
                {td.deleteButton}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="pdt-content">
        {/* Members */}
        <section className="pdt-section">
          <h2 className="pdt-section__title">
            <Users size={16} aria-hidden="true" />
            {td.membersTitle} ({project.members.length})
          </h2>
          <ul className="pdt-members">
            {project.members.map((m) => (
              <li key={m.id} className="pdt-members__item">
                <span className="pdt-members__avatar" aria-hidden="true">
                  {(m.name || m.username).charAt(0).toUpperCase()}
                </span>
                <div className="pdt-members__info">
                  <span className="pdt-members__name">
                    {m.name || m.username}
                  </span>
                  {m.name && (
                    <span className="pdt-members__username">@{m.username}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Files grid */}
        <section className="pdt-section">
          <h2 className="pdt-section__title">
            <FileText size={16} aria-hidden="true" />
            {td.filesTitle} ({filteredFiles.length})
          </h2>

          {/* Type filters */}
          <div
            className="pdt-type-tabs"
            role="tablist"
            aria-label={td.filterByTypeAria}
          >
            <button
              type="button"
              role="tab"
              aria-selected={fileTypeFilter === ""}
              className={`pdt-type-tab${fileTypeFilter === "" ? " pdt-type-tab--active" : ""}`}
              onClick={() => handleTypeChange("")}
            >
              {td.filterAll}
            </button>
            {FILE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={fileTypeFilter === type}
                className={`pdt-type-tab${fileTypeFilter === type ? " pdt-type-tab--active" : ""}`}
                onClick={() => handleTypeChange(type)}
              >
                {CATEGORY_LABELS[type]}
              </button>
            ))}
          </div>

          {paginatedFiles.length === 0 ? (
            <p className="pdt-files-empty">{td.noFilesFound}</p>
          ) : (
            <div className="pdt-files-grid">
              {paginatedFiles.map((file) => {
                const category = getFileCategory(file.name);
                return (
                  <article
                    key={file.path}
                    className="pdt-file-card pdt-file-card--clickable"
                    onClick={() =>
                      setSelectedFile({
                        path: file.path,
                        name: file.name,
                        category: CATEGORY_LABELS[category],
                      })
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedFile({
                          path: file.path,
                          name: file.name,
                          category: CATEGORY_LABELS[category],
                        });
                      }
                    }}
                    aria-label={`${td.fileViewer.openFileAria}: ${file.name}`}
                  >
                    <div className="pdt-file-card__header">
                      <span
                        className={`pdt-file-card__badge pdt-file-card__badge--${category}`}
                      >
                        {CATEGORY_LABELS[category]}
                      </span>
                    </div>
                    <h4 className="pdt-file-card__name">{file.name}</h4>
                    <code className="pdt-file-card__path">{file.path}</code>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="pdt-pagination" aria-label={td.paginationAria}>
              <span className="pdt-pagination__info">
                {td.pageInfo(filePage, totalPages, filteredFiles.length)}
              </span>
              <div className="pdt-pagination__controls">
                <button
                  type="button"
                  className="pdt-pagination__btn"
                  disabled={filePage <= 1}
                  onClick={() => setFilePage((p) => p - 1)}
                  aria-label={td.prevPage}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                  {td.prevPage}
                </button>
                <button
                  type="button"
                  className="pdt-pagination__btn"
                  disabled={filePage >= totalPages}
                  onClick={() => setFilePage((p) => p + 1)}
                  aria-label={td.nextPage}
                >
                  {td.nextPage}
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </nav>
          )}
        </section>

        {/* Directory tree */}
        <section className="pdt-section">
          <h2 className="pdt-section__title">
            <FolderOpen size={16} aria-hidden="true" />
            {td.directoryTreeTitle}
          </h2>
          <div className="pdt-tree-container">
            <DirectoryTree
              tree={compactLeadingDuplicateDirectory(
                project.directoryTree as TreeNode,
              )}
            />
          </div>
        </section>
      </div>

      {selectedFile && (
        <FileViewerModal
          projectId={project.id}
          filePath={selectedFile.path}
          fileName={selectedFile.name}
          category={selectedFile.category}
          onClose={() => setSelectedFile(null)}
          t={td.fileViewer}
        />
      )}

      {showEditModal && (
        <EditProjectModal
          project={project}
          allFiles={allFiles}
          isUpdating={isUpdating}
          onSave={update}
          onClose={() => setShowEditModal(false)}
          t={td.editModal}
        />
      )}

      {showDeleteConfirm && (
        <div
          className="pdt-delete-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={td.deleteModal.title}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting)
              setShowDeleteConfirm(false);
          }}
        >
          <div className="pdt-delete-card">
            <h2 className="pdt-delete-card__title">{td.deleteModal.title}</h2>
            <p className="pdt-delete-card__message">
              {td.deleteModal.message(project.name)}
            </p>
            <div className="pdt-delete-card__actions">
              <button
                type="button"
                className="pdt-delete-card__cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                {td.deleteModal.cancelButton}
              </button>
              <button
                type="button"
                className="pdt-delete-card__confirm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2
                      size={14}
                      aria-hidden="true"
                      className="pdt-loading__icon"
                    />
                    {td.deleteModal.confirming}
                  </>
                ) : (
                  td.deleteModal.confirmButton
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
