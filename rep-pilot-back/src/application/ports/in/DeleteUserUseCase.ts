export interface DeleteUserUseCase {
  execute(userIdToDelete: string, executorUserId: string): Promise<void>;
}
