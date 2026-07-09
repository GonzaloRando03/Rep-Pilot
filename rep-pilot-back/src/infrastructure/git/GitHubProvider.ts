import {
  GitProviderPort,
  RepoOwnerInfo,
  RepositoryFile,
} from "../../application/ports/out/GitProviderPort";

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  url: string;
}

interface GitHubTreeResponse {
  tree: GitHubTreeItem[];
  message?: string;
}

interface GitHubFileResponse {
  content?: string;
  encoding?: string;
  message?: string;
}

export class GitHubProvider implements GitProviderPort {
  supports(repoUrl: string): boolean {
    return repoUrl.startsWith("https://github.com/");
  }

  getRepoOwner(repoUrl: string): RepoOwnerInfo {
    const { owner } = this.parseUrl(repoUrl);
    return { owner, provider: "github" };
  }

  async listFiles(repoUrl: string, token?: string): Promise<RepositoryFile[]> {
    const { owner, repo } = this.parseUrl(repoUrl);
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;

    const headers = this.buildHeaders(token);
    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      throw new Error(
        `GitHub API error ${response.status}: ${await response.text()}`,
      );
    }

    const data = (await response.json()) as GitHubTreeResponse;

    if (!data.tree) {
      throw new Error(data.message ?? "Unexpected GitHub API response");
    }

    return data.tree.map((item) => ({
      path: item.path,
      name: item.path.split("/").pop() ?? item.path,
      type: item.type === "blob" ? "file" : "dir",
      gitUrl: `https://github.com/${owner}/${repo}/blob/HEAD/${item.path}`,
    }));
  }

  async getFileContent(
    repoUrl: string,
    filePath: string,
    token?: string,
  ): Promise<string | null> {
    const { owner, repo } = this.parseUrl(repoUrl);
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    const headers = this.buildHeaders(token);
    const response = await fetch(apiUrl, { headers });

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new Error(
        `GitHub API error ${response.status}: ${await response.text()}`,
      );
    }

    const data = (await response.json()) as GitHubFileResponse;

    if (!data.content) return null;

    return Buffer.from(data.content, "base64").toString("utf-8");
  }

  async getFileContentBuffer(
    repoUrl: string,
    filePath: string,
    token?: string,
  ): Promise<Buffer | null> {
    const { owner, repo } = this.parseUrl(repoUrl);
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    const headers = this.buildHeaders(token);
    const response = await fetch(apiUrl, { headers });

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new Error(
        `GitHub API error ${response.status}: ${await response.text()}`,
      );
    }

    const data = (await response.json()) as GitHubFileResponse;
    if (!data.content) return null;

    return Buffer.from(data.content.replace(/\n/g, ""), "base64");
  }

  private buildHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "rep-pilot-back",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  private parseUrl(repoUrl: string): { owner: string; repo: string } {
    const match = repoUrl.match(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/,
    );
    if (!match) {
      throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
    }
    return { owner: match[1], repo: match[2] };
  }
}
