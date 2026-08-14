import { useState } from "react";
import { UserPlus, Pencil, Trash2, Users } from "lucide-react";
import { useAuth } from "../../../shared/hooks/useAuth";
import type { UserDTO } from "../../../shared/lib/users/usersApi";
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from "../../../shared/lib/users/usersApi";
import type { UseUsersReturn } from "../../../shared/hooks/useUsers";
import { UserFormModal } from "./UserFormModal";
import "./UsersSection.css";

interface UsersSectionTranslations {
  title: string;
  subtitle: string;
  addButton: string;
  table: {
    name: string;
    username: string;
    email: string;
    language: string;
    role: string;
    actions: string;
  };
  adminBadge: string;
  userBadge: string;
  editButton: string;
  deleteButton: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  deleteSuccess: string;
  deleteError: string;
  emptyTitle: string;
  emptyDescription: string;
  loadingAriaLabel: string;
  modal: {
    createTitle: string;
    editTitle: string;
    fields: {
      name: string;
      username: string;
      email: string;
      password: string;
      isAdmin: string;
      language: string;
    };
    placeholders: {
      name: string;
      username: string;
      email: string;
      password: string;
      passwordEdit: string;
    };
    saveButton: string;
    saving: string;
    cancelButton: string;
    required: string;
  };
}

interface UsersSectionProps {
  hook: UseUsersReturn;
  t: UsersSectionTranslations;
}

export function UsersSection({ hook, t }: UsersSectionProps) {
  const { user: currentUser } = useAuth();
  const { users, isLoading, isSaving, isDeleting, create, update, remove } =
    hook;
  const [editingUser, setEditingUser] = useState<UserDTO | null | undefined>(
    undefined,
  );
  const [deletingUser, setDeletingUser] = useState<UserDTO | null>(null);
  const isModalOpen = editingUser !== undefined;
  const isDeleteModalOpen = deletingUser !== null;

  const handleSave = async (
    data: CreateUserPayload | UpdateUserPayload,
    userId?: string,
  ): Promise<boolean> => {
    if (userId) {
      return update(userId, data as UpdateUserPayload);
    }
    return create(data as CreateUserPayload);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deletingUser) return;
    const success = await remove(deletingUser.id);
    if (success) {
      setDeletingUser(null);
    }
  };

  return (
    <section className="users-section" aria-label={t.title}>
      <div className="users-section__header">
        <div className="users-section__title-block">
          <h2 className="users-section__title">{t.title}</h2>
          <p className="users-section__subtitle">{t.subtitle}</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--secondary"
          onClick={() => setEditingUser(null)}
          disabled={isLoading}
        >
          <UserPlus size={15} aria-hidden="true" />
          {t.addButton}
        </button>
      </div>

      <div
        className={`users-section__body${isLoading ? " users-section__body--loading" : ""}`}
      >
        {isLoading ? (
          <span
            className="git-section__spinner"
            role="status"
            aria-label={t.loadingAriaLabel}
          />
        ) : users.length === 0 ? (
          <div className="users-section__empty">
            <Users size={32} aria-hidden="true" />
            <p className="users-section__empty-title">{t.emptyTitle}</p>
            <p className="users-section__empty-desc">{t.emptyDescription}</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th className="users-table__th">{t.table.name}</th>
                <th className="users-table__th">{t.table.username}</th>
                <th className="users-table__th">{t.table.email}</th>
                <th className="users-table__th">{t.table.role}</th>
                <th className="users-table__th users-table__th--actions">
                  {t.table.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="users-table__row">
                  <td className="users-table__td">{user.name}</td>
                  <td className="users-table__td users-table__td--mono">
                    {user.username}
                  </td>
                  <td className="users-table__td users-table__td--mono">
                    {user.email}
                  </td>
                  <td className="users-table__td">
                    <span
                      className={`users-badge${user.isAdmin ? " users-badge--admin" : ""}`}
                    >
                      {user.isAdmin ? t.adminBadge : t.userBadge}
                    </span>
                  </td>
                  <td className="users-table__td users-table__td--actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      onClick={() => setEditingUser(user)}
                    >
                      <Pencil size={14} aria-hidden="true" />
                      {t.editButton}
                    </button>
                    {currentUser?.id !== user.id && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        onClick={() => setDeletingUser(user)}
                        disabled={isDeleting}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        {t.deleteButton}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <UserFormModal
          user={editingUser ?? null}
          isSaving={isSaving}
          onSave={handleSave}
          onClose={() => setEditingUser(undefined)}
          t={t.modal}
        />
      )}

      {isDeleteModalOpen && deletingUser && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-card__header">
              <h3 className="modal-card__title">{t.deleteConfirmTitle}</h3>
            </div>
            <p className="modal-description">{t.deleteConfirmMessage}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
              >
                {t.modal.cancelButton}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--danger-solid"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "…" : t.deleteButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
