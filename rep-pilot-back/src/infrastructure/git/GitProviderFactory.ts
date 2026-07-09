import { GitProviderPort } from "../../application/ports/out/GitProviderPort";
import { GitProviderFactoryPort } from "../../application/use-cases/scan-repository/ScanRepository";
import { GitHubProvider } from "./GitHubProvider";
import { GitLabProvider } from "./GitLabProvider";

export class GitProviderFactory implements GitProviderFactoryPort {
  private readonly providers: GitProviderPort[] = [
    new GitHubProvider(),
    new GitLabProvider(),
  ];

  getProvider(repoUrl: string): GitProviderPort {
    const provider = this.providers.find((p) => p.supports(repoUrl));
    if (!provider) {
      throw new Error(
        `No git provider found for URL: ${repoUrl}. Supported: GitHub, GitLab`,
      );
    }
    return provider;
  }
}
