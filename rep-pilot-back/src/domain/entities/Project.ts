import { DomainValidationError } from "../errors/DomainValidationError";
import { ProjectId } from "../value-objects/ProjectId";
import { UserId } from "../value-objects/UserId";

export class Project {
  private constructor(
    public readonly id: ProjectId,
    public readonly name: string,
    public readonly members: ReadonlyArray<UserId>,
    public readonly rootFolderName: string,
    public readonly directoryTree: Record<string, unknown>,
    public readonly createdAt: Date,
    public readonly createdBy: UserId,
    public readonly group: string | undefined,
  ) {}

  static create(params: {
    id?: ProjectId;
    name: string;
    members?: UserId[];
    rootFolderName: string;
    directoryTree?: Record<string, unknown>;
    createdAt?: Date;
    createdBy: UserId;
    group?: string;
  }): Project {
    const normalizedName = params.name?.trim();
    if (!normalizedName) {
      throw new DomainValidationError("Project name is required");
    }

    const normalizedFolder = params.rootFolderName?.trim();
    if (!normalizedFolder) {
      throw new DomainValidationError("Project rootFolderName is required");
    }

    const members = params.members ?? [];
    const createdBy = params.createdBy;

    const memberIds = new Set(members.map((m) => m.toString()));
    if (!memberIds.has(createdBy.toString())) {
      members.push(createdBy);
    }

    const normalizedGroup = params.group?.trim() || undefined;

    return new Project(
      params.id ?? ProjectId.create(),
      normalizedName,
      members,
      normalizedFolder,
      params.directoryTree ?? {},
      params.createdAt ?? new Date(),
      createdBy,
      normalizedGroup,
    );
  }

  addMember(userId: UserId): Project {
    const alreadyMember = this.members.some(
      (m) => m.toString() === userId.toString(),
    );
    if (alreadyMember) {
      throw new DomainValidationError(
        `User ${userId} is already a member of this project`,
      );
    }
    return new Project(
      this.id,
      this.name,
      [...this.members, userId],
      this.rootFolderName,
      this.directoryTree,
      this.createdAt,
      this.createdBy,
      this.group,
    );
  }

  withName(newName: string): Project {
    const normalized = newName?.trim();
    if (!normalized) {
      throw new DomainValidationError("Project name is required");
    }
    return new Project(
      this.id,
      normalized,
      this.members,
      this.rootFolderName,
      this.directoryTree,
      this.createdAt,
      this.createdBy,
      this.group,
    );
  }

  withGroup(newGroup: string | undefined): Project {
    return new Project(
      this.id,
      this.name,
      this.members,
      this.rootFolderName,
      this.directoryTree,
      this.createdAt,
      this.createdBy,
      newGroup,
    );
  }

  withMembers(memberIds: string[]): Project {
    const uniqueIds = [...new Set(memberIds)];
    const users = uniqueIds.map((id) => UserId.create(id));

    if (!users.some((u) => u.toString() === this.createdBy.toString())) {
      users.push(this.createdBy);
    }

    return new Project(
      this.id,
      this.name,
      users,
      this.rootFolderName,
      this.directoryTree,
      this.createdAt,
      this.createdBy,
      this.group,
    );
  }

  withDirectoryTree(tree: Record<string, unknown>): Project {
    return new Project(
      this.id,
      this.name,
      this.members,
      this.rootFolderName,
      tree,
      this.createdAt,
      this.createdBy,
      this.group,
    );
  }
}
