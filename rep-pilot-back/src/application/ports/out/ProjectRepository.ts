import { Project } from "../../../domain/entities/Project";

export interface ProjectRepository {
  save(project: Project): Promise<void>;
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  findByMember(userId: string): Promise<Project[]>;
  findByGroup(group: string): Promise<Project[]>;
  findDistinctGroups(): Promise<string[]>;
  deleteById(id: string): Promise<void>;
}
