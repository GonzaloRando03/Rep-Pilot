import { User } from "../../domain/entities/User";
import { UserDTO } from "../dto/UserDTO";

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id.toString(),
    username: user.username,
    name: user.name,
    isAdmin: user.isAdmin,
    language: user.language,
    twoFactorEnabled: user.twoFactorEnabled,
    email: user.email,
  };
}
