import { DeleteUserUseCase } from "../../ports/in/DeleteUserUseCase";
import { UserRepository } from "../../ports/out/UserRepository";
import { ProjectRepository } from "../../ports/out/ProjectRepository";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";
import { DomainValidationError } from "../../../domain/errors/DomainValidationError";

export class DeleteUser implements DeleteUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly resourceRepository: ResourceRepository,
  ) {}

  async execute(userIdToDelete: string, executorUserId: string): Promise<void> {
    const userToDelete = await this.userRepository.findById(userIdToDelete);
    if (!userToDelete) {
      throw new NotFoundError(`User with id '${userIdToDelete}' not found`);
    }

    if (userIdToDelete === executorUserId) {
      throw new ForbiddenError("You cannot delete your own account.");
    }

    // Find the system admin to reassign resources to.
    // Priority: the default "admin" user created by create-admin.js,
    // fallback to the first admin found.
    const targetAdmin = await this.findTargetAdmin(executorUserId);
    const adminId = targetAdmin.id.toString();

    // 1. Remove the user from all projects they belong to.
    const projects = await this.projectRepository.findByMember(userIdToDelete);
    for (const project of projects) {
      const filteredMembers = project.members
        .map((m) => m.toString())
        .filter((memberId) => memberId !== userIdToDelete);
      const updated = project.withMembers(filteredMembers);
      await this.projectRepository.save(updated);
    }

    // 2. Reassign all resources created by this user to the target admin.
    const resources =
      await this.resourceRepository.findByCreatedBy(userIdToDelete);
    for (const resource of resources) {
      const updated = resource.withCreatedBy(adminId);
      await this.resourceRepository.save(updated);
    }

    // 3. Finally, delete the user.
    await this.userRepository.deleteById(userIdToDelete);
  }

  private async findTargetAdmin(executorUserId: string) {
    // Try the default system admin first (created by create-admin.js)
    const defaultAdmin = await this.userRepository.findByUsername("admin");
    if (defaultAdmin && defaultAdmin.isAdmin) {
      return defaultAdmin;
    }

    // Fallback: find any admin user, excluding the one being deleted.
    const allUsers = await this.userRepository.findAll();
    const anotherAdmin = allUsers.find(
      (u) => u.isAdmin && u.id.toString() !== executorUserId,
    );

    if (!anotherAdmin) {
      throw new DomainValidationError(
        "No admin user found to reassign resources to.",
      );
    }

    return anotherAdmin;
  }
}
