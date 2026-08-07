import { useState } from "react";
import { UserPlus, Pencil, Users } from "lucide-react";
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
  const { users, isLoading, isSaving, create, update } = hook;
  const [editingUser, setEditingUser] = useState<UserDTO | null | undefined>(
    undefined,
  );
  const isModalOpen = editingUser !== undefined;

  const handleSave = async (
    data: CreateUserPayload | UpdateUserPayload,
    userId?: string,
  ): Promise<boolean> => {
    if (userId) {
      return update(userId, data as UpdateUserPayload);
    }
    return create(data as CreateUserPayload);
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
    </section>
  );
}
