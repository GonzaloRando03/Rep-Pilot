import { Language } from "../language/Language";

const USER_KEY = "auth_user";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  isAdmin: boolean;
  language: Language;
  twoFactorEnabled: boolean;
}

export const userStorage = {
  get(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  set(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    localStorage.removeItem(USER_KEY);
  },
};
