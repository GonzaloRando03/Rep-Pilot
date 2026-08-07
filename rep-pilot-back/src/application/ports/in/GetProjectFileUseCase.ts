export interface GetProjectFileUseCase {
  execute(
    projectId: string,
    filePath: string,
  ): Promise<{ path: string; content: string }>;
}
