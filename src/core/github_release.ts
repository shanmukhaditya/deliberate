export interface GitHubReleaseOptions {
  token?: string;
  repoOwner?: string;
  repoName?: string;
  tagName: string;
  releaseTitle: string;
  bodyMarkdown: string;
  draft?: boolean;
  prerelease?: boolean;
}

export class GitHubReleasePublisher {
  /**
   * Publishes release directly to GitHub via REST API
   */
  static async publish(options: GitHubReleaseOptions): Promise<{ success: boolean; url: string; error?: string }> {
    const token = options.token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const owner = options.repoOwner || 'shanmukhaditya';
    const repo = options.repoName || 'deliberate';

    if (!token) {
      return {
        success: false,
        url: `https://github.com/${owner}/${repo}/releases/new?tag=${encodeURIComponent(options.tagName)}`,
        error: 'No GITHUB_TOKEN or GH_TOKEN found in environment.',
      };
    }

    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;
      const payload = {
        tag_name: options.tagName,
        name: options.releaseTitle,
        body: options.bodyMarkdown,
        draft: Boolean(options.draft),
        prerelease: Boolean(options.prerelease),
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'deliberate-ai-cli',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        return {
          success: false,
          url: `https://github.com/${owner}/${repo}/releases/new?tag=${encodeURIComponent(options.tagName)}`,
          error: `GitHub API error (${res.status}): ${errText}`,
        };
      }

      const data = (await res.json()) as any;
      return {
        success: true,
        url: data.html_url || `https://github.com/${owner}/${repo}/releases/tag/${options.tagName}`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        url: `https://github.com/${owner}/${repo}/releases/new?tag=${encodeURIComponent(options.tagName)}`,
        error: (err as Error).message,
      };
    }
  }
}
