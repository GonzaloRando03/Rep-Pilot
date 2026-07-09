import {
  GitProviderPort,
  RepoOwnerInfo,
  RepositoryFile,
} from "../../application/ports/out/GitProviderPort";

interface GitLabTreeItem {
  id: string;
  name: string;
  path: string;
  type: "blob" | "tree";
}

export class GitLabProvider implements GitProviderPort {
  supports(repoUrl: string): boolean {
    // Accepts any https/http URL that is not GitHub (self-hosted GitLab instances included)
    return repoUrl.startsWith("https://") || repoUrl.startsWith("http://");
  }

  getRepoOwner(repoUrl: string): RepoOwnerInfo {
    const { namespace } = this.parseUrl(repoUrl);
    const owner = namespace.split("/")[0];
    return { owner, provider: "gitlab" };
  }

  async listFiles(repoUrl: string, token?: string): Promise<RepositoryFile[]> {
    const { host, namespace } = this.parseUrl(repoUrl);
    const encodedNamespace = encodeURIComponent(namespace);
    const baseApiUrl = `${host}/api/v4/projects/${encodedNamespace}/repository/tree`;

    const headers = this.buildHeaders(token);

    const files: RepositoryFile[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = `${baseApiUrl}?recursive=true&per_page=${perPage}&page=${page}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(
          `GitLab API error ${response.status}: ${await response.text()}`,
        );
      }

      const items = (await response.json()) as GitLabTreeItem[];

      for (const item of items) {
        files.push({
          path: item.path,
          name: item.name,
          type: item.type === "blob" ? "file" : "dir",
          gitUrl: `${repoUrl}/-/blob/HEAD/${item.path}`,
        });
      }

      if (items.length < perPage) break;
      page++;
    }

    return files;
  }

  async getFileContent(
    repoUrl: string,
    filePath: string,
    token?: string,
  ): Promise<string | null> {
    const { host, namespace } = this.parseUrl(repoUrl);
    const encodedNamespace = encodeURIComponent(namespace);
    const encodedPath = encodeURIComponent(filePath);
    const apiUrl = `${host}/api/v4/projects/${encodedNamespace}/repository/files/${encodedPath}/raw?ref=HEAD`;

    const headers = this.buildHeaders(token);
    const response = await fetch(apiUrl, { headers });

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new Error(
        `GitLab API error ${response.status}: ${await response.text()}`,
      );
    }

    return response.text();
  }

  async getFileContentBuffer(
    repoUrl: string,
    filePath: string,
    token?: string,
  ): Promise<Buffer | null> {
    const { host, namespace } = this.parseUrl(repoUrl);
    const encodedNamespace = encodeURIComponent(namespace);
    const encodedPath = encodeURIComponent(filePath);
    const apiUrl = `${host}/api/v4/projects/${encodedNamespace}/repository/files/${encodedPath}/raw?ref=HEAD`;

    const headers = this.buildHeaders(token);
    const response = await fetch(apiUrl, { headers });

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new Error(
        `GitLab API error ${response.status}: ${await response.text()}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private buildHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["PRIVATE-TOKEN"] = token;
    return headers;
  }

  private parseUrl(repoUrl: string): { host: string; namespace: string } {
    const match = repoUrl.match(/^(https?:\/\/[^/]+)\/(.+?)(?:\.git)?\/?$/);
    if (!match) {
      throw new Error(`Invalid GitLab repository URL: ${repoUrl}`);
    }
    return { host: match[1], namespace: match[2] };
  }
}
