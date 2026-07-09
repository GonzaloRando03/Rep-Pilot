export interface DownloadResult {
  buffer: Buffer;
  filename: string;
}

export interface DownloadResourceUseCase {
  execute(resourceId: string): Promise<DownloadResult>;
}
