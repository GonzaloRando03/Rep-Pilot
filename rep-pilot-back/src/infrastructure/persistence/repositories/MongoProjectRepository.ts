import { ProjectRepository } from "../../../application/ports/out/ProjectRepository";
import { Project } from "../../../domain/entities/Project";
import { ProjectModel } from "../mongodb/schemas/ProjectSchema";
import {
  toDomainProject,
  toProjectDocument,
} from "../mongodb/mappers/ProjectPersistenceMapper";

export class MongoProjectRepository implements ProjectRepository {
  async save(project: Project): Promise<void> {
    await ProjectModel.findByIdAndUpdate(
      project.id.toString(),
      toProjectDocument(project),
      { upsert: true, new: true },
    );
  }

  async findById(id: string): Promise<Project | null> {
    const doc = await ProjectModel.findById(id);
    if (!doc) return null;
    return toDomainProject(doc);
  }

  async findAll(): Promise<Project[]> {
    const docs = await ProjectModel.find();
    return docs.map(toDomainProject);
  }

  async findByMember(userId: string): Promise<Project[]> {
    const docs = await ProjectModel.find({ members: userId });
    return docs.map(toDomainProject);
  }

  async findByGroup(group: string): Promise<Project[]> {
    const docs = await ProjectModel.find({ group });
    return docs.map(toDomainProject);
  }

  async findDistinctGroups(): Promise<string[]> {
    const result = await ProjectModel.distinct("group");
    return result.filter((g): g is string => g != null && g.trim().length > 0);
  }

  async deleteById(id: string): Promise<void> {
    await ProjectModel.findByIdAndDelete(id);
  }
}
