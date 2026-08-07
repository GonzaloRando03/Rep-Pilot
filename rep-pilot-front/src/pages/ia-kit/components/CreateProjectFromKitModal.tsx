import { useState, useEffect } from "react";
import JSZip from "jszip";
import { FolderGit2, Loader2, X, Check } from "lucide-react";
import { FormInput } from "../../../shared/ui/FormInput/FormInput";
import { GroupSelect } from "../../../shared/ui/GroupSelect/GroupSelect";
import { createProject } from "../../../shared/lib/projects/projectsApi";
import type { ProjectFileEntry } from "../../../shared/lib/projects/projectsApi";
import { fetchUsers, type UserDTO } from "../../../shared/lib/users/usersApi";
import { toast } from "../../../shared/lib/toast/toastBus";
import { useTranslation } from "../../../shared/hooks/useTranslation";
import "./CreateProjectFromKitModal.css";

interface CreateProjectFromKitModalProps {
  kitBlob: Blob;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
}

function isTextFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const textExtensions = new Set([
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "md",
    "mdx",
    "css",
    "scss",
    "less",
    "html",
    "htm",
    "xml",
    "svg",
    "yaml",
    "yml",
    "toml",
    "ini",
    "cfg",
    "env",
    "gitignore",
    "dockerignore",
    "editorconfig",
    "eslintrc",
    "prettierrc",
    "sh",
    "bash",
    "zsh",
    "fish",
    "ps1",
    "bat",
    "cmd",
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
    "cs",
    "fs",
    "fsx",
    "sql",
    "graphql",
    "gql",
    "prisma",
    "txt",
    "log",
    "csv",
    "tsv",
    "vue",
    "svelte",
    "astro",
  ]);
  return textExtensions.has(ext) || !ext.includes(".") || ext.length > 6;
}

const README_PATTERN = /^(?:.*\/)?readme(?:\.\w+)?$/i;

/** Find the directory containing the README. Returns "" if README is at root level. */
function findReadmeDir(zip: JSZip): string | null {
  const paths = Object.keys(zip.files).filter((p) => !p.endsWith("/"));
  const readmePath = paths.find((p) => README_PATTERN.test(p));
  if (!readmePath) return null;
  const lastSlash = readmePath.lastIndexOf("/");
  return lastSlash === -1 ? "" : readmePath.slice(0, lastSlash);
}

/**
 * Determine the root prefix (path segment to strip) and root folder name
 * based on README location and .github presence.
 */
function detectRootPrefix(zip: JSZip): {
  prefix: string;
  rootName: string;
} {
  const paths = Object.keys(zip.files).filter((p) => !p.endsWith("/"));
  const readmeDir = findReadmeDir(zip);

  if (readmeDir === null) {
    // Fallback: use first common top-level folder
    if (paths.length === 0) return { prefix: "", rootName: "" };
    const firstSlash = paths[0].indexOf("/");
    if (firstSlash === -1) return { prefix: "", rootName: "" };
    const candidate = paths[0].slice(0, firstSlash);
    const allMatch = paths.every(
      (p) => p === candidate || p.startsWith(candidate + "/"),
    );
    if (!allMatch) return { prefix: "", rootName: "" };
    return { prefix: candidate + "/", rootName: candidate };
  }

  const readmeLevel = readmeDir ? readmeDir + "/" : "";

  // If .github exists at README level, use it as root
  const githubDir = readmeLevel + ".github/";
  const hasGithub = Object.keys(zip.files).some(
    (p) => p.startsWith(githubDir) || p === readmeLevel + ".github",
  );
  if (hasGithub) {
    return { prefix: githubDir, rootName: ".github" };
  }

  // Otherwise, root = the README's directory
  const rootName = readmeDir ? readmeDir.split("/").pop()! : "";
  return { prefix: readmeLevel, rootName };
}

async function extractZipFiles(
  zipBlob: Blob,
  rootPrefix: string,
): Promise<ProjectFileEntry[]> {
  const zip = await JSZip.loadAsync(zipBlob);
  const files: ProjectFileEntry[] = [];

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;

    // Skip README
    if (README_PATTERN.test(path)) continue;

    // Only include files under rootPrefix
    if (rootPrefix && !path.startsWith(rootPrefix)) continue;

    const relativePath = rootPrefix ? path.slice(rootPrefix.length) : path;
    const blob = await entry.async("blob");

    if (isTextFile(path)) {
      const content = await entry.async("text");
      files.push({ path: relativePath, content });
    } else {
      const base64 = await blobToBase64(blob);
      files.push({ path: relativePath, content: base64 });
    }
  }

  return files;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function CreateProjectFromKitModal({
  kitBlob,
  onClose,
  onProjectCreated,
}: CreateProjectFromKitModalProps) {
  const t = useTranslation();
  const tc = t.iaKit.createProjectModal;

  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [rootFolderName, setRootFolderName] = useState("");
  const [rootPrefix, setRootPrefix] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Members selector (same pattern as CreateProjectModal)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState("");

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) {
      next.name = tc.nameRequired;
    }
    if (selectedMembers.length === 0) {
      next.members = tc.membersRequired;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // Fetch users and detect root folder from zip on mount
  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));

    JSZip.loadAsync(kitBlob).then((zip) => {
      const result = detectRootPrefix(zip);
      setRootPrefix(result.prefix);
      if (result.rootName) setRootFolderName(result.rootName);
    });
  }, [kitBlob]);

  function toggleMember(userId: string) {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
    if (errors.members) setErrors((prev) => ({ ...prev, members: "" }));
  }

  const filteredUsers = users.filter((u) => {
    const s = memberSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(s) || u.username.toLowerCase().includes(s)
    );
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsCreating(true);
    try {
      const files = await extractZipFiles(kitBlob, rootPrefix);

      const result = await createProject({
        name: name.trim(),
        members: selectedMembers,
        rootFolderName: rootFolderName || name.trim(),
        files,
        group: group.trim() || undefined,
      });

      toast.success(tc.createSuccess);
      onProjectCreated(result.id);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : tc.createError;
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="create-project-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={tc.title}
    >
      <div className="create-project-modal">
        <div className="create-project-modal__header">
          <div className="create-project-modal__header-icon">
            <FolderGit2 size={20} />
          </div>
          <h2 className="create-project-modal__title">{tc.title}</h2>
          <button
            type="button"
            className="create-project-modal__close"
            onClick={onClose}
            aria-label={tc.closeAriaLabel}
          >
            <X size={18} />
          </button>
        </div>

        <form
          className="create-project-modal__form"
          onSubmit={handleSubmit}
          noValidate
        >
          <FormInput
            id="project-name"
            label={tc.nameLabel}
            value={name}
            onChange={(v) => {
              setName(v);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder={tc.namePlaceholder}
            error={errors.name}
            disabled={isCreating}
            autoComplete="off"
          />

          <FormInput
            id="project-root-folder"
            label={tc.rootFolderLabel}
            value={rootFolderName}
            onChange={setRootFolderName}
            placeholder={
              rootFolderName ? tc.rootFolderDetected : tc.rootFolderPlaceholder
            }
            disabled={isCreating}
            autoComplete="off"
          />

          <GroupSelect
            value={group}
            onChange={setGroup}
            label={tc.groupLabel}
            placeholder={tc.groupPlaceholder}
            createLabel={tc.groupCreateLabel}
            loadingText={tc.groupLoadingText}
            noResultsText={tc.groupNoResultsText}
            disabled={isCreating}
          />

          {/* Members selector */}
          <div className="create-project-modal__field">
            <label className="create-project-modal__members-label">
              {tc.membersLabel}
            </label>

            {selectedMembers.length > 0 && (
              <div
                className="create-project-modal__members-chips"
                aria-label={tc.selectedMembersAria}
              >
                {selectedMembers.map((id) => {
                  const u = users.find((x) => x.id === id);
                  if (!u) return null;
                  return (
                    <span
                      key={id}
                      className="create-project-modal__members-chip"
                    >
                      {u.name || u.username}
                      <button
                        type="button"
                        className="create-project-modal__members-chip-remove"
                        onClick={() => toggleMember(id)}
                        aria-label={tc.removeMemberAria(u.name || u.username)}
                        disabled={isCreating}
                      >
                        <X size={12} aria-hidden="true" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="create-project-modal__members-dropdown">
              <input
                type="text"
                className="create-project-modal__members-search"
                placeholder={
                  usersLoading ? tc.loadingUsers : tc.membersSearchPlaceholder
                }
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                disabled={isCreating || usersLoading}
                aria-label={tc.membersSearchAria}
              />
              <div className="create-project-modal__members-list">
                {filteredUsers.length === 0 ? (
                  <p className="create-project-modal__members-empty">
                    {usersLoading ? tc.loadingUsers : tc.noUsersFound}
                  </p>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className={[
                        "create-project-modal__members-item",
                        selectedMembers.includes(u.id)
                          ? "create-project-modal__members-item--selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => toggleMember(u.id)}
                      disabled={isCreating}
                    >
                      <span className="create-project-modal__members-item-name">
                        {u.name || u.username}
                      </span>
                      <span className="create-project-modal__members-item-username">
                        {u.username}
                      </span>
                      {selectedMembers.includes(u.id) && (
                        <Check
                          size={14}
                          aria-hidden="true"
                          className="create-project-modal__members-item-check"
                        />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {errors.members && (
              <p className="create-project-modal__field-error" role="alert">
                {errors.members}
              </p>
            )}
          </div>

          <div className="create-project-modal__actions">
            <button
              type="button"
              className="create-project-modal__cancel"
              onClick={onClose}
              disabled={isCreating}
            >
              {tc.cancelButton}
            </button>
            <button
              type="submit"
              className="create-project-modal__submit"
              disabled={isCreating || !name.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>{tc.creating}</span>
                </>
              ) : (
                <>
                  <FolderGit2 size={16} />
                  <span>{tc.submitButton}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
