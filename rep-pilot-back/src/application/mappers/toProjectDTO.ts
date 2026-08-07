import { ProjectDTO } from "../dto/ProjectDTO";
import { Project } from "../../domain/entities/Project";

export function toProjectDTO(
  project: Project,
  userMap: Map<string, { username: string; name: string }>,
): ProjectDTO {
  const creatorInfo = userMap.get(project.createdBy.toString());
  return {
    id: project.id.toString(),
    name: project.name,
    members: project.members.map((m) => {
      const info = userMap.get(m.toString());
      return {
        id: m.toString(),
        username: info?.username ?? m.toString(),
        name: info?.name ?? m.toString(),
      };
    }),
    rootFolderName: project.rootFolderName,
    directoryTree: project.directoryTree,
    createdAt: project.createdAt.toISOString(),
    createdBy: {
      id: project.createdBy.toString(),
      username: creatorInfo?.username ?? project.createdBy.toString(),
      name: creatorInfo?.name ?? project.createdBy.toString(),
    },
    group: project.group,
  };
}
