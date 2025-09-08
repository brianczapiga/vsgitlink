import * as vscode from 'vscode';
import { GitHubLinkInfo } from './githubLinkHandler';

export class GitHubUrlParser {
    parseUrl(url: string): GitHubLinkInfo | null {
        // GitHub URL patterns:
        // https://github.com/owner/repo/blob/branch/path/to/file.ts#L10-L20
        // https://github.com/owner/repo/blob/branch/path/to/file.ts#L10
        // https://github.com/owner/repo/blob/branch/path/to/file.ts
        // https://github.com/owner/repo/tree/branch/path/to/directory
        // https://github.com/owner/repo (just the repo)

        const githubRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/(?:blob|tree)\/([^\/]+)\/(.+?))?(?:#L(\d+)(?:-L(\d+))?)?$/;
        const match = url.match(githubRegex);

        if (!match) {
            return null;
        }

        const [, owner, repo, branch, filePath, startLineStr, endLineStr] = match;

        // Get the configured default branch
        const config = vscode.workspace.getConfiguration('vsgitlink');
        const defaultBranch = config.get<string>('defaultBranch', 'main');

        const result: GitHubLinkInfo = {
            owner,
            repo,
            branch: branch || defaultBranch, // Use configured default branch
            filePath: filePath || ''
        };

        if (startLineStr) {
            result.startLine = parseInt(startLineStr, 10);
        }

        if (endLineStr) {
            result.endLine = parseInt(endLineStr, 10);
        }

        return result;
    }
}
