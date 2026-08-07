import { Project } from "../../../../domain/entities/Project";
import { ProjectId } from "../../../../domain/value-objects/ProjectId";
import { UserId } from "../../../../domain/value-objects/UserId";
import { ProjectDocument } from "../schemas/ProjectSchema";

export function toProjectDocument(project: Project): Record<string, unknown> {
  return {
    _id: project.id.toString(),
    name: project.name,
    members: project.members.map((m) => m.toString()),
    rootFolderName: project.rootFolderName,
    directoryTree: project.directoryTree,
    createdAt: project.createdAt,
    createdBy: project.createdBy.toString(),
    group: project.group,
  };
}

export function toDomainProject(doc: ProjectDocument): Project {
  return Project.create({
    id: ProjectId.create(doc._id),
    name: doc.name,
    members: doc.members.map((id) => UserId.create(id)),
    rootFolderName: doc.rootFolderName,
    directoryTree: doc.directoryTree,
    createdAt: doc.createdAt,
    createdBy: UserId.create(doc.createdBy),
    group: doc.group,
  });
}
