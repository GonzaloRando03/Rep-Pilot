export interface CreateUserDTO {
  username: string;
  name: string;
  password: string;
  isAdmin?: boolean;
  language?: string;
}

export interface UserDTO {
  id: string;
  username: string;
  name: string;
  isAdmin: boolean;
  language: string;
  twoFactorEnabled: boolean;
}

export interface UpdateUserDTO {
  name?: string;
  username?: string;
  isAdmin?: boolean;
  language?: string;
  password?: string;
}
