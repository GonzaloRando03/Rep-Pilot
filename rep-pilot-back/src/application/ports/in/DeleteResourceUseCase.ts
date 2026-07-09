export interface DeleteResourceUseCase {
  execute(id: string, userId: string, isAdmin: boolean): Promise<void>;
}
