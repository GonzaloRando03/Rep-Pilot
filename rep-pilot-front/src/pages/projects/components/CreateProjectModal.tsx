import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderUp, X, Loader2, Check, File } from "lucide-react";
import { fetchUsers, type UserDTO } from "../../../shared/lib/users/usersApi";
import { GroupSelect } from "../../../shared/ui/GroupSelect/GroupSelect";
import { useProjects } from "../../../shared/hooks/useProjects";
import type { ProjectFileEntry } from "../../../shared/lib/projects/projectsApi";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import "./CreateProjectModal.css";

interface CreateProjectModalProps {
  onClose: () => void;
  t: Translations["projects"]["modal"];
}

interface DroppedFile {
  path: string;
  content: string;
}

const REQUIRED_FILE_PATTERNS = [
  (p: string) => p === "AGENTS.md" || p.endsWith("/AGENTS.md"),
  (p: string) => p.endsWith("instructions.md"),
  (p: string) => p === "SKILL.md" || p.endsWith("/SKILL.md"),
];

function hasRequiredFiles(files: DroppedFile[]): boolean {
  return REQUIRED_FILE_PATTERNS.some((pattern) =>
    files.some((f) => pattern(f.path)),
  );
}

function isTextFile(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const textExtensions = [
    "md",
    "txt",
    "yml",
    "yaml",
    "json",
    "xml",
    "csv",
    "ts",
    "tsx",
    "js",
    "jsx",
    "html",
    "css",
    "scss",
    "less",
    "py",
    "rb",
    "go",
    "rs",
    "java",
    "kt",
    "swift",
    "c",
    "cpp",
    "h",
    "hpp",
    "sh",
    "bash",
    "zsh",
    "ps1",
    "bat",
    "gitignore",
    "env",
    "cfg",
    "ini",
    "toml",
    "lock",
    "instructions.md",
    "agent.md",
    "prompt.md",
  ];
  if (ext === "md" || ext === "txt" || ext === "yml" || ext === "yaml")
    return true;
  if (textExtensions.includes(ext)) return true;
  if (name.startsWith(".") && !name.includes(".")) return true;
  return false;
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
}

async function traverseEntry(
  entry: FileSystemEntry,
  basePath: string,
): Promise<DroppedFile[]> {
  const results: DroppedFile[] = [];

  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    const file = await new Promise<File>((resolve, reject) => {
      fileEntry.file(resolve, reject);
    });

    const fullPath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (isTextFile(entry.name)) {
      const content = await readFileAsText(file);
      results.push({ path: fullPath, content });
    }
  } else if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const reader = dirEntry.createReader();
    const dirPath = basePath ? `${basePath}/${entry.name}` : entry.name;

    const readAllEntries = (): Promise<FileSystemEntry[]> => {
      return new Promise((resolve) => {
        const all: FileSystemEntry[] = [];
        const readBatch = () => {
          reader.readEntries((entries) => {
            if (entries.length === 0) {
              resolve(all);
            } else {
              all.push(...entries);
              readBatch();
            }
          });
        };
        readBatch();
      });
    };

    const entries = await readAllEntries();
    for (const child of entries) {
      const childResults = await traverseEntry(child, dirPath);
      results.push(...childResults);
    }
  }

  return results;
}

export function CreateProjectModal({ onClose, t }: CreateProjectModalProps) {
  const { create, isCreating } = useProjects();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [group, setGroup] = useState("");

  const [users, setUsers] = useState<UserDTO[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState("");

  const [droppedFiles, setDroppedFiles] = useState<DroppedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const dropRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);
  const rootFolderNameRef = useRef("");

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => {
        /* silently fail, users will be empty */
      })
      .finally(() => setUsersLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /* ── Drag & drop handlers ── */
  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    setDragError(null);

    const items = e.dataTransfer.items;
    if (!items?.length) return;

    const entry = items[0]?.webkitGetAsEntry?.();
    if (items.length !== 1 || !entry || !entry.isDirectory) {
      setDragError(t.dropFolderRequired);
      return;
    }

    rootFolderNameRef.current = entry.name;
    const allFiles = await traverseEntry(entry, "");

    if (allFiles.length === 0) {
      setDragError(t.dropNoTextFiles);
      return;
    }

    if (!hasRequiredFiles(allFiles)) {
      setDragError(t.dropNoRequiredFiles);
      return;
    }

    setDroppedFiles(allFiles);
  }

  /* ── Member toggle ── */
  function toggleMember(userId: string) {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
    setMembersError(null);
  }

  const filteredUsers = users.filter((u) => {
    const search = memberSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(search) ||
      u.username.toLowerCase().includes(search)
    );
  });

  /* ── Validation & submit ── */
  function validate(): boolean {
    let valid = true;
    if (!name.trim()) {
      setNameError(t.nameRequired);
      valid = false;
    }
    if (selectedMembers.length === 0) {
      setMembersError(t.membersRequired);
      valid = false;
    }
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const files: ProjectFileEntry[] = droppedFiles.map((f) => ({
      path: f.path,
      content: f.content,
    }));

    const project = await create({
      name: name.trim(),
      members: selectedMembers,
      rootFolderName: rootFolderNameRef.current,
      files,
      group: group.trim() || undefined,
    });

    onClose();
    if (project) navigate(`/projects/${project.id}`);
  }

  return (
    <div className="cp-backdrop" onClick={onClose}>
      <div
        className="cp-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cp-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cp-card__header">
          <div className="cp-card__title-group">
            <h2 id="cp-title" className="cp-card__title">
              {t.title}
            </h2>
          </div>
          <button
            type="button"
            className="cp-card__close"
            onClick={onClose}
            aria-label={t.closeAriaLabel}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="cp-card__form" onSubmit={handleSubmit} noValidate>
          {/* Project name */}
          <div className="cp-field">
            <label className="cp-field__label" htmlFor="cp-name">
              {t.nameLabel}
            </label>
            <input
              id="cp-name"
              className={`cp-field__input${nameError ? " cp-field__input--invalid" : ""}`}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder={t.namePlaceholder}
              disabled={isCreating}
              aria-describedby={nameError ? "cp-name-error" : undefined}
              aria-invalid={!!nameError}
            />
            {nameError && (
              <p id="cp-name-error" className="cp-field__error" role="alert">
                {nameError}
              </p>
            )}
          </div>

          {/* Group */}
          <div className="cp-field">
            <GroupSelect
              value={group}
              onChange={setGroup}
              label={t.groupLabel}
              placeholder={t.groupPlaceholder}
              createLabel={t.groupCreateLabel}
              loadingText={t.groupLoadingText}
              noResultsText={t.groupNoResultsText}
              disabled={isCreating}
            />
          </div>

          {/* Members */}
          <div className="cp-field">
            <label className="cp-field__label" id="cp-members-label">
              {t.membersLabel}
            </label>

            {/* Selected chips */}
            {selectedMembers.length > 0 && (
              <div
                className="cp-members-chips"
                aria-label={t.selectedMembersAria}
              >
                {selectedMembers.map((id) => {
                  const u = users.find((x) => x.id === id);
                  if (!u) return null;
                  return (
                    <span key={id} className="cp-members-chip">
                      {u.name || u.username}
                      <button
                        type="button"
                        className="cp-members-chip__remove"
                        onClick={() => toggleMember(id)}
                        aria-label={t.removeMemberAria(u.name || u.username)}
                        disabled={isCreating}
                      >
                        <X size={12} aria-hidden="true" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Search + list */}
            <div className="cp-members-dropdown">
              <input
                type="text"
                className="cp-field__input"
                placeholder={
                  usersLoading ? t.loadingUsers : t.membersSearchPlaceholder
                }
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                disabled={isCreating || usersLoading}
                aria-label={t.membersSearchAria}
              />
              <div
                className="cp-members-list"
                role="listbox"
                aria-labelledby="cp-members-label"
              >
                {filteredUsers.length === 0 ? (
                  <p className="cp-members-list__empty">
                    {usersLoading ? t.loadingUsers : t.noUsersFound}
                  </p>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      role="option"
                      aria-selected={selectedMembers.includes(u.id)}
                      className={`cp-members-item${selectedMembers.includes(u.id) ? " cp-members-item--selected" : ""}`}
                      onClick={() => toggleMember(u.id)}
                      disabled={isCreating}
                    >
                      <span className="cp-members-item__name">
                        {u.name || u.username}
                      </span>
                      <span className="cp-members-item__username">
                        {u.username}
                      </span>
                      {selectedMembers.includes(u.id) && (
                        <Check
                          size={14}
                          aria-hidden="true"
                          className="cp-members-item__check"
                        />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {membersError && (
              <p id="cp-members-error" className="cp-field__error" role="alert">
                {membersError}
              </p>
            )}
          </div>

          {/* Drop zone */}
          <div className="cp-field">
            <label className="cp-field__label">{t.dropZoneLabel}</label>
            <div
              ref={dropRef}
              className={`cp-dropzone${isDragging ? " cp-dropzone--active" : ""}${droppedFiles.length > 0 ? " cp-dropzone--filled" : ""}${dragError ? " cp-dropzone--error" : ""}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              aria-label={t.dropZoneAria}
            >
              {droppedFiles.length > 0 ? (
                <div className="cp-dropzone__files">
                  <div className="cp-dropzone__files-header">
                    <FolderUp size={18} aria-hidden="true" />
                    <span>{t.filesDetected(droppedFiles.length)}</span>
                  </div>
                  <ul className="cp-dropzone__file-list">
                    {droppedFiles.slice(0, 8).map((f) => (
                      <li key={f.path} className="cp-dropzone__file-item">
                        <File size={12} aria-hidden="true" />
                        <code>{f.path}</code>
                      </li>
                    ))}
                    {droppedFiles.length > 8 && (
                      <li className="cp-dropzone__file-more">
                        {t.andMore(droppedFiles.length - 8)}
                      </li>
                    )}
                  </ul>
                  <button
                    type="button"
                    className="cp-dropzone__clear"
                    onClick={() => {
                      setDroppedFiles([]);
                      setDragError(null);
                    }}
                    disabled={isCreating}
                  >
                    {t.clearFiles}
                  </button>
                </div>
              ) : (
                <div className="cp-dropzone__placeholder">
                  <FolderUp
                    size={32}
                    aria-hidden="true"
                    className="cp-dropzone__placeholder-icon"
                  />
                  <p className="cp-dropzone__placeholder-text">
                    {t.dropZonePlaceholder}
                  </p>
                  <p className="cp-dropzone__placeholder-hint">
                    {t.dropZoneHint}
                  </p>
                </div>
              )}

              {dragError && (
                <p className="cp-field__error cp-dropzone__error" role="alert">
                  {dragError}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="cp-card__actions">
            <button
              type="button"
              className="cp-btn cp-btn--secondary"
              onClick={onClose}
              disabled={isCreating}
            >
              {t.cancelButton}
            </button>
            <button
              type="submit"
              className="cp-btn cp-btn--primary"
              disabled={isCreating || droppedFiles.length === 0}
            >
              {isCreating ? (
                <>
                  <Loader2
                    size={14}
                    aria-hidden="true"
                    className="cp-btn__spinner"
                  />
                  {t.creating}
                </>
              ) : (
                t.submitButton
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
