import { useState, useEffect, useCallback } from "react";
import {
  fetchUsers,
  createUser,
  updateUser,
  type UserDTO,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../lib/users/usersApi";
import { toast } from "../lib/toast/toastBus";
import { useTranslation } from "./useTranslation";

interface UsersState {
  users: UserDTO[];
  isLoading: boolean;
  isSaving: boolean;
}

export interface UseUsersReturn extends UsersState {
  create: (data: CreateUserPayload) => Promise<boolean>;
  update: (id: string, data: UpdateUserPayload) => Promise<boolean>;
}

export function useUsers(): UseUsersReturn {
  const t = useTranslation();
  const tu = t.admin.users;

  const [state, setState] = useState<UsersState>({
    users: [],
    isLoading: true,
    isSaving: false,
  });

  useEffect(() => {
    fetchUsers()
      .then((users) => setState({ users, isLoading: false, isSaving: false }))
      .catch(() => {
        setState((s) => ({ ...s, isLoading: false }));
        toast.error(tu.loadError);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = useCallback(
    async (data: CreateUserPayload): Promise<boolean> => {
      setState((s) => ({ ...s, isSaving: true }));
      try {
        const newUser = await createUser(data);
        setState((s) => ({
          ...s,
          users: [...s.users, newUser],
          isSaving: false,
        }));
        toast.success(tu.modal.createSuccess);
        return true;
      } catch {
        setState((s) => ({ ...s, isSaving: false }));
        toast.error(tu.modal.createError);
        return false;
      }
    },
    [tu.modal.createSuccess, tu.modal.createError],
  );

  const update = useCallback(
    async (id: string, data: UpdateUserPayload): Promise<boolean> => {
      setState((s) => ({ ...s, isSaving: true }));
      try {
        const updated = await updateUser(id, data);
        setState((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === id ? updated : u)),
          isSaving: false,
        }));
        toast.success(tu.modal.updateSuccess);
        return true;
      } catch {
        setState((s) => ({ ...s, isSaving: false }));
        toast.error(tu.modal.updateError);
        return false;
      }
    },
    [tu.modal.updateSuccess, tu.modal.updateError],
  );

  return { ...state, create, update };
}
