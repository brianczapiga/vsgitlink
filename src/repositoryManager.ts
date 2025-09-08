import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { simpleGit, SimpleGit } from 'simple-git';
import { GitHubLinkInfo } from './githubLinkHandler';

export class RepositoryManager {
    private readonly reposPath: string;

    constructor() {
        // Use the user's preferred repos directory structure
        this.reposPath = path.join(require('os').homedir(), 'repos');
    }

    async ensureRepository(linkInfo: GitHubLinkInfo): Promise<string> {
        const repoPath = path.join(this.reposPath, linkInfo.owner, linkInfo.repo);

        // Check if repository already exists
        if (fs.existsSync(repoPath)) {
            const git = simpleGit(repoPath);
            
            // Check if it's a valid git repository
            try {
                await git.status();
                return repoPath;
            } catch (error) {
                // Directory exists but isn't a git repo, remove it and clone fresh
                fs.rmSync(repoPath, { recursive: true, force: true });
            }
        }

        // Clone the repository
        await this.cloneRepository(linkInfo, repoPath);
        return repoPath;
    }

    private async cloneRepository(linkInfo: GitHubLinkInfo, repoPath: string): Promise<void> {
        try {
            // Ensure the parent directory exists
            const parentDir = path.dirname(repoPath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }

            const cloneUrl = `https://github.com/${linkInfo.owner}/${linkInfo.repo}.git`;
            
            vscode.window.showInformationMessage(`Cloning ${linkInfo.owner}/${linkInfo.repo}...`);
            
            const git = simpleGit();
            await git.clone(cloneUrl, repoPath);

            // Checkout the specific branch if it's not the default
            if (linkInfo.branch !== 'main') {
                const repoGit = simpleGit(repoPath);
                try {
                    await repoGit.checkout(linkInfo.branch);
                } catch (error) {
                    // Branch might not exist locally, try to fetch and checkout
                    await repoGit.fetch('origin', linkInfo.branch);
                    await repoGit.checkout(`origin/${linkInfo.branch}`);
                }
            }

            vscode.window.showInformationMessage(`Successfully cloned ${linkInfo.owner}/${linkInfo.repo}`);
        } catch (error) {
            throw new Error(`Failed to clone repository: ${error}`);
        }
    }
}
