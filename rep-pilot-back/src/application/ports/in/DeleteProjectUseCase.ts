export interface DeleteProjectUseCase {
  execute(id: string, userId: string, isAdmin: boolean): Promise<void>;
}
