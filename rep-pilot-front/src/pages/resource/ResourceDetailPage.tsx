import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  ExternalLink,
  Star,
  CalendarDays,
  User,
  Server,
  Pencil,
  Trash2,
} from "lucide-react";
import { useResourceDetail } from "../../shared/hooks/useResourceDetail";
import { useTranslation } from "../../shared/hooks/useTranslation";
import { TagChip } from "../../shared/ui/TagChip/TagChip";
import { tokenStorage } from "../../shared/lib/auth/tokenStorage";
import { userStorage } from "../../shared/lib/auth/userStorage";
import { BASE_URL, isSessionExpiredError } from "../../shared/lib/apiClient";
import { toast } from "../../shared/lib/toast/toastBus";
import {
  deleteResource,
  getResourceById,
  getResourceTypeLabel,
} from "../../shared/lib/resources/resourcesApi";
import { EditResourceModal } from "./components/EditResourceModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import "./ResourceDetailPage.css";

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useTranslation().resourceDetail;
  const {
    resource,
    isLoading,
    error,
    isStarred,
    starCount,
    isTogglingstar,
    toggleStar,
  } = useResourceDetail(id ?? "");

  const [isDownloading, setIsDownloading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedResource, setEditedResource] = useState<typeof resource>(null);

  const displayResource = editedResource ?? resource;

  const handleDownload = async () => {
    if (!resource) return;
    setIsDownloading(true);
    try {
      const token = tokenStorage.get();
      const response = await fetch(
        `${BASE_URL}/api/resources/${resource.id}/download`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resource.name}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (!isSessionExpiredError(err)) {
        toast.error(t.errorServer);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const formattedDate = resource?.createdAt
    ? new Date(resource.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const createdByLabel = resource?.createdBy
    ? typeof resource.createdBy === "string"
      ? resource.createdBy
      : resource.createdBy.name || resource.createdBy.username
    : null;

  const currentUser = userStorage.get();
  const canManage =
    !!currentUser &&
    (currentUser.isAdmin ||
      (!!resource?.createdBy &&
        typeof resource.createdBy !== "string" &&
        resource.createdBy.id === currentUser.id));

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!resource) return;
    setIsDeleting(true);
    try {
      await deleteResource(resource.id);
      toast.success(t.deleteSuccess);
      navigate("/catalog");
    } catch (err) {
      if (!isSessionExpiredError(err)) {
        toast.error(t.errorServer);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleResourceUpdated = async () => {
    if (!id) return;
    try {
      const fresh = await getResourceById(id);
      setEditedResource(fresh);
    } catch (err) {
      if (!isSessionExpiredError(err)) {
        toast.error(t.errorServer);
      }
    }
  };

  const editModalT = {
    edit: t.edit,
    saveButton: t.editModal.saveButton,
    saving: t.editModal.saving,
    cancel: t.editModal.cancel,
    nameLabel: t.editModal.nameLabel,
    namePlaceholder: t.editModal.namePlaceholder,
    nameRequired: t.editModal.nameRequired,
    descriptionLabel: t.editModal.descriptionLabel,
    descriptionPlaceholder: t.editModal.descriptionPlaceholder,
    tagsLabel: t.editModal.tagsLabel,
    tagsPlaceholder: t.editModal.tagsPlaceholder,
    success: t.editSuccess,
    forbidden: t.editModal.forbidden,
    error: t.errorServer,
    removeTagAriaLabel: t.editModal.removeTagAriaLabel,
    addTagAriaLabel: t.editModal.addTagAriaLabel,
    addTagButton: t.editModal.addTagButton,
    noTagsFound: t.editModal.noTagsFound,
    newTagPlaceholder: t.editModal.newTagPlaceholder,
    createTagButton: t.editModal.createTagButton,
  };

  return (
    <div className="resource-detail">
      <button
        type="button"
        className="resource-detail__back"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t.backButton}
      </button>

      {isLoading && (
        <div className="resource-detail__skeleton" aria-busy="true">
          <div className="rd-skeleton-header">
            <span className="skeleton-line skeleton-line--short" />
            <span className="skeleton-line" style={{ width: "40%" }} />
          </div>
          <div className="skeleton-line" style={{ width: "60%" }} />
          <div className="rd-skeleton-body">
            <div className="rd-skeleton-doc">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="skeleton-line" />
              ))}
            </div>
            <div className="rd-skeleton-meta">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="skeleton-line skeleton-line--short" />
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="resource-detail__error" role="alert">
          <AlertTriangle size={28} aria-hidden="true" />
          <p>
            {error === "not_found"
              ? t.errorNotFound
              : error === "unauthorized"
                ? t.errorUnauthorized
                : t.errorServer}
          </p>
        </div>
      )}

      {!isLoading && displayResource && (
        <>
          <header className="resource-detail__header">
            <h1 className="resource-detail__title">{displayResource.name}</h1>
            <p className="resource-detail__description">
              {displayResource.description}
            </p>

            {displayResource.tags.length > 0 && (
              <div className="tag-row">
                {displayResource.tags.map((tag) => (
                  <TagChip key={tag.id} label={tag.name} />
                ))}
              </div>
            )}
          </header>

          <div className="resource-detail__body">
            <section
              className="resource-detail__doc"
              aria-label={t.documentationAriaLabel}
            >
              {displayResource.docMD ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ children, href, ...props }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                    table: ({ children, ...props }) => (
                      <div className="resource-detail__doc-table-wrapper">
                        <table {...props}>{children}</table>
                      </div>
                    ),
                  }}
                >
                  {displayResource.docMD}
                </ReactMarkdown>
              ) : (
                <p className="resource-detail__no-doc">{t.noDoc}</p>
              )}
            </section>

            <aside className="resource-detail__sidebar">
              <dl className="resource-detail__meta">
                <div className="resource-detail__meta-item resource-detail__meta-item--stars">
                  <div className="resource-detail__stars-row">
                    <span
                      className={`resource-type-badge resource-type-badge--${displayResource.type}`}
                    >
                      {getResourceTypeLabel(displayResource.type)}
                    </span>
                    <button
                      type="button"
                      className={`resource-detail__star-btn${isStarred ? " resource-detail__star-btn--active" : ""}`}
                      onClick={toggleStar}
                      disabled={isTogglingstar}
                      aria-label={isStarred ? t.unstar : t.star}
                      aria-pressed={isStarred}
                    >
                      <Star
                        size={15}
                        aria-hidden="true"
                        fill={isStarred ? "currentColor" : "none"}
                      />
                      {starCount}
                    </button>
                  </div>
                </div>

                {formattedDate && (
                  <div className="resource-detail__meta-item">
                    <dt>
                      <CalendarDays size={13} aria-hidden="true" />
                      {t.createdAt}
                    </dt>
                    <dd>{formattedDate}</dd>
                  </div>
                )}
                {displayResource.createdBy && (
                  <div className="resource-detail__meta-item">
                    <dt>
                      <User size={13} aria-hidden="true" />
                      {t.createdBy}
                    </dt>
                    <dd>{createdByLabel}</dd>
                  </div>
                )}
                {displayResource.provider && (
                  <div className="resource-detail__meta-item">
                    <dt>
                      <Server size={13} aria-hidden="true" />
                      {t.provider}
                    </dt>
                    <dd className="resource-detail__provider">
                      {displayResource.provider}
                      {displayResource.owner && (
                        <span className="resource-detail__owner">
                          / {displayResource.owner}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                {(displayResource.gitUrl || displayResource.hasFiles) && (
                  <div className="resource-detail__meta-item resource-detail__meta-item--link">
                    {displayResource.gitUrl && (
                      <a
                        href={displayResource.gitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-detail__repo-link"
                      >
                        <ExternalLink size={14} aria-hidden="true" />
                        {t.openRepo}
                      </a>
                    )}
                    <button
                      type="button"
                      className="resource-detail__download-btn"
                      onClick={handleDownload}
                      disabled={isDownloading}
                      aria-label={t.download}
                    >
                      <Download size={14} aria-hidden="true" />
                      {isDownloading ? t.downloading : t.download}
                    </button>
                  </div>
                )}
              </dl>

              {canManage && (
                <div className="resource-detail__owner-actions">
                  <button
                    type="button"
                    className="resource-detail__action-btn resource-detail__action-btn--edit"
                    onClick={handleEdit}
                    aria-label={t.edit}
                  >
                    <Pencil size={14} aria-hidden="true" />
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    className="resource-detail__action-btn resource-detail__action-btn--delete"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    aria-label={t.delete}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    {isDeleting ? "…" : t.delete}
                  </button>
                </div>
              )}
            </aside>
          </div>
        </>
      )}

      {showEditModal && resource && (
        <EditResourceModal
          resource={resource}
          onClose={() => setShowEditModal(false)}
          onUpdated={handleResourceUpdated}
          t={editModalT}
        />
      )}

      {showDeleteConfirm && resource && (
        <DeleteConfirmModal
          resourceName={resource.name}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          t={{
            title: t.deleteModal.title,
            message: t.deleteConfirm,
            confirmButton: t.deleteModal.confirmButton,
            confirming: t.deleteModal.confirming,
            cancel: t.editModal.cancel,
          }}
        />
      )}
    </div>
  );
}
