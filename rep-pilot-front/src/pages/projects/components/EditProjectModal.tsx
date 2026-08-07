import { useEffect, useRef, useState } from "react";
import { X, Loader2, File, Trash2 } from "lucide-react";
import { fetchUsers, type UserDTO } from "../../../shared/lib/users/usersApi";
import { GroupSelect } from "../../../shared/ui/GroupSelect/GroupSelect";
import type {
  ProjectResponse,
  ProjectFileEntry,
  UpdateProjectPayload,
} from "../../../shared/lib/projects/projectsApi";
import type { Translations } from "../../../shared/lib/i18n/Translations";
import "./EditProjectModal.css";

interface EditProjectModalProps {
  project: ProjectResponse;
  allFiles: { name: string; path: string }[];
  isUpdating: boolean;
  onSave: (payload: UpdateProjectPayload) => Promise<boolean>;
  onClose: () => void;
  t: Translations["projects"]["detail"]["editModal"];
}

interface DroppedFile {
  path: string;
  content: string;
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
            if (entries.length === 0) resolve(all);
            else {
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

export function EditProjectModal({
  project,
  allFiles,
  isUpdating,
  onSave,
  onClose,
  t,
}: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [nameError, setNameError] = useState<string | null>(null);

  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    project.members.map((m) => m.id),
  );
  const [membersError, setMembersError] = useState<string | null>(null);
  const [group, setGroup] = useState(project.group ?? "");

  const [users, setUsers] = useState<UserDTO[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState("");

  const [currentFilePaths, setCurrentFilePaths] = useState<Set<string>>(
    new Set(allFiles.map((f) => f.path)),
  );
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);
  const [addedFiles, setAddedFiles] = useState<DroppedFile[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const dropRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isUpdating) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isUpdating]);

  /* ── Drag & drop ── */
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

    const newFiles: DroppedFile[] = [];
    let hasDirectory = false;

    for (const item of Array.from(items)) {
      const entry = item.webkitGetAsEntry?.();
      if (!entry) continue;

      if (entry.isDirectory) {
        hasDirectory = true;
        const dirFiles = await traverseEntry(entry, "");
        newFiles.push(...dirFiles);
      } else if (entry.isFile) {
        const file = item.getAsFile();
        if (file && isTextFile(entry.name)) {
          const content = await readFileAsText(file);
          newFiles.push({ path: entry.name, content });
        }
      }
    }

    if (!hasDirectory) {
      setDragError(t.dropFolderRequired);
      return;
    }

    if (newFiles.length === 0) {
      setDragError(t.dropNoTextFiles);
      return;
    }

    // Merge: overwrite if path already exists (added or current), skip removed
    setAddedFiles((prev) => {
      const merged = new Map<string, DroppedFile>();
      // Keep existing added files not in the new drop
      for (const f of prev) {
        if (!newFiles.some((nf) => nf.path === f.path)) {
          merged.set(f.path, f);
        }
      }
      // Add new files (overwrites existing)
      for (const f of newFiles) {
        merged.set(f.path, f);
      }
      return Array.from(merged.values());
    });

    // Re-add any previously removed files that are in the new drop
    setRemovedFiles((prev) =>
      prev.filter((p) => !newFiles.some((nf) => nf.path === p)),
    );
    setCurrentFilePaths((prev) => {
      const next = new Set(prev);
      for (const f of newFiles) next.add(f.path);
      return next;
    });
  }

  /* ── Members ── */
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

  /* ── File removal ── */
  function removeExistingFile(path: string) {
    setRemovedFiles((prev) => [...prev, path]);
    setCurrentFilePaths((prev) => {
      const next = new Set(prev);
      next.delete(path);
      return next;
    });
  }

  function removeAddedFile(path: string) {
    setAddedFiles((prev) => prev.filter((f) => f.path !== path));
    setCurrentFilePaths((prev) => {
      const next = new Set(prev);
      next.delete(path);
      return next;
    });
  }

  /* ── Submit ── */
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

    const payload: UpdateProjectPayload = {};

    if (name.trim() !== project.name) payload.name = name.trim();
    if (group !== (project.group ?? "")) payload.group = group || undefined;

    const membersChanged =
      selectedMembers.length !== project.members.length ||
      !selectedMembers.every((id) => project.members.some((m) => m.id === id));
    if (membersChanged) payload.members = selectedMembers;

    const fileEntries: ProjectFileEntry[] = [
      ...addedFiles.map((f) => ({ path: f.path, content: f.content })),
    ];
    if (removedFiles.length > 0 || addedFiles.length > 0) {
      payload.files = fileEntries;
      if (removedFiles.length > 0) payload.removedFiles = removedFiles;
    }

    const success = await onSave(payload);
    if (success) onClose();
  }

  const visibleFiles = allFiles.filter((f) => currentFilePaths.has(f.path));
  const hasChanges =
    name.trim() !== project.name ||
    group !== (project.group ?? "") ||
    addedFiles.length > 0 ||
    removedFiles.length > 0 ||
    selectedMembers.length !== project.members.length ||
    !selectedMembers.every((id) => project.members.some((m) => m.id === id));

  return (
    <div className="ep-backdrop" onClick={isUpdating ? undefined : onClose}>
      <div
        className="ep-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ep-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="ep-card__header">
          <h2 id="ep-title" className="ep-card__title">
            {t.title}
          </h2>
          <button
            type="button"
            className="ep-card__close"
            onClick={onClose}
            aria-label={t.closeAriaLabel}
            disabled={isUpdating}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="ep-card__form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="ep-field">
            <label className="ep-field__label" htmlFor="ep-name">
              {t.nameLabel}
            </label>
            <input
              id="ep-name"
              className={`ep-field__input${nameError ? " ep-field__input--invalid" : ""}`}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder={t.namePlaceholder}
              disabled={isUpdating}
              aria-invalid={!!nameError}
            />
            {nameError && (
              <p className="ep-field__error" role="alert">
                {nameError}
              </p>
            )}
          </div>

          {/* Group */}
          <div className="ep-field">
            <GroupSelect
              value={group}
              onChange={setGroup}
              label={t.groupLabel}
              placeholder={t.groupPlaceholder}
              createLabel={t.groupCreateLabel}
              loadingText={t.groupLoadingText}
              noResultsText={t.groupNoResultsText}
              disabled={isUpdating}
            />
          </div>

          {/* Members */}
          <div className="ep-field">
            <label className="ep-field__label" id="ep-members-label">
              {t.membersLabel}
            </label>

            {selectedMembers.length > 0 && (
              <div
                className="ep-members-chips"
                aria-label={t.selectedMembersAria}
              >
                {selectedMembers.map((id) => {
                  const u = users.find((x) => x.id === id);
                  const name = u ? u.name || u.username : id;
                  return (
                    <span key={id} className="ep-members-chip">
                      {name}
                      <button
                        type="button"
                        className="ep-members-chip__remove"
                        onClick={() => toggleMember(id)}
                        aria-label={t.removeMemberAria(name)}
                        disabled={isUpdating}
                      >
                        <X size={12} aria-hidden="true" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <input
              type="search"
              className="ep-field__input"
              placeholder={t.membersSearchPlaceholder}
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              aria-label={t.membersSearchAria}
              disabled={isUpdating}
            />

            {memberSearch && (
              <div
                className="ep-members-dropdown"
                role="listbox"
                aria-label={t.membersLabel}
              >
                {usersLoading && (
                  <p className="ep-members-dropdown__status">
                    {t.loadingUsers}
                  </p>
                )}
                {!usersLoading && filteredUsers.length === 0 && (
                  <p className="ep-members-dropdown__status">
                    {t.noUsersFound}
                  </p>
                )}
                {filteredUsers.map((u) => {
                  const selected = selectedMembers.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`ep-members-dropdown__item${selected ? " ep-members-dropdown__item--selected" : ""}`}
                      onClick={() => toggleMember(u.id)}
                      disabled={isUpdating}
                    >
                      <span className="ep-members-dropdown__name">
                        {u.name || u.username}
                      </span>
                      {u.name && (
                        <span className="ep-members-dropdown__username">
                          @{u.username}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {membersError && (
              <p className="ep-field__error" role="alert">
                {membersError}
              </p>
            )}
          </div>

          {/* Current files */}
          <div className="ep-field">
            <label className="ep-field__label">{t.currentFilesLabel}</label>
            {visibleFiles.length === 0 ? (
              <p className="ep-files-empty">{t.noFiles}</p>
            ) : (
              <ul className="ep-files-list">
                {visibleFiles.map((f) => (
                  <li key={f.path} className="ep-files-list__item">
                    <File size={14} aria-hidden="true" />
                    <code className="ep-files-list__path">{f.path}</code>
                    <button
                      type="button"
                      className="ep-files-list__remove"
                      onClick={() => removeExistingFile(f.path)}
                      aria-label={t.removeFileAria(f.name)}
                      disabled={isUpdating}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Added (pending) files */}
          {addedFiles.length > 0 && (
            <div className="ep-field">
              <label className="ep-field__label ep-field__label--added">
                {t.addFilesLabel} ({addedFiles.length})
              </label>
              <ul className="ep-files-list ep-files-list--added">
                {addedFiles.map((f) => (
                  <li key={f.path} className="ep-files-list__item">
                    <File size={14} aria-hidden="true" />
                    <code className="ep-files-list__path">{f.path}</code>
                    <button
                      type="button"
                      className="ep-files-list__remove"
                      onClick={() => removeAddedFile(f.path)}
                      aria-label={t.removeFileAria(f.path)}
                      disabled={isUpdating}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Drop zone */}
          <div className="ep-field">
            <label className="ep-field__label">{t.addFilesLabel}</label>
            <div
              ref={dropRef}
              className={`ep-dropzone${isDragging ? " ep-dropzone--active" : ""}${isUpdating ? " ep-dropzone--disabled" : ""}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              aria-label={t.dropZoneAria}
              aria-busy={isDragging}
            >
              <p className="ep-dropzone__text">{t.dropZonePlaceholder}</p>
              <p className="ep-dropzone__hint">{t.dropZoneHint}</p>
            </div>
            {dragError && (
              <p className="ep-field__error" role="alert">
                {dragError}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="ep-actions">
            <button
              type="button"
              className="ep-actions__cancel"
              onClick={onClose}
              disabled={isUpdating}
            >
              {t.cancelButton}
            </button>
            <button
              type="submit"
              className="ep-actions__save"
              disabled={isUpdating || !hasChanges}
            >
              {isUpdating ? (
                <>
                  <Loader2
                    size={14}
                    aria-hidden="true"
                    className="ep-spinner"
                  />
                  {t.saving}
                </>
              ) : (
                t.saveButton
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
